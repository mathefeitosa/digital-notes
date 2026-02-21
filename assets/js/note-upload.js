(function () {
    "use strict";

    var modal = document.getElementById("upload-note-modal");
    var openButton = document.getElementById("open-upload-note-modal");
    var closeButtons = document.querySelectorAll("[data-close-upload-modal]");
    var form = document.getElementById("upload-note-form");
    var fileInput = document.getElementById("upload-note-file");
    var filenameInput = document.getElementById("upload-note-filename");
    var titleInput = document.getElementById("upload-note-title-input");
    var tagsInput = document.getElementById("upload-note-tags");
    var seasonInput = document.getElementById("upload-note-season");
    var overwriteInput = document.getElementById("upload-note-overwrite");
    var secretInput = document.getElementById("upload-note-secret");
    var submitButton = document.getElementById("upload-note-submit");
    var statusElement = document.getElementById("upload-note-status");
    var secretStorageKey = "note-upload-secret";
    var defaultSubmitLabel = submitButton ? submitButton.textContent : "Enviar";

    if (!modal || !openButton || !form || !fileInput || !statusElement) {
        return;
    }

    function setStatus(message, type, commitUrl) {
        statusElement.textContent = "";
        statusElement.classList.remove("error", "success");

        if (type) {
            statusElement.classList.add(type);
        }

        if (!message) {
            return;
        }

        statusElement.appendChild(document.createTextNode(message));

        if (commitUrl) {
            var link = document.createElement("a");
            link.href = commitUrl;
            link.target = "_blank";
            link.rel = "noreferrer noopener";
            link.textContent = "Ver commit";
            link.style.marginLeft = "8px";
            statusElement.appendChild(link);
        }
    }

    function toggleModal(isOpen) {
        modal.classList.toggle("is-open", isOpen);
        modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
        document.body.style.overflow = isOpen ? "hidden" : "";

        if (!isOpen && submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = defaultSubmitLabel;
        }
    }

    function readStoredSecret() {
        try {
            return localStorage.getItem(secretStorageKey) || "";
        } catch (error) {
            return "";
        }
    }

    function storeSecret(secret) {
        try {
            if (secret) {
                localStorage.setItem(secretStorageKey, secret);
            } else {
                localStorage.removeItem(secretStorageKey);
            }
        } catch (error) {
            return;
        }
    }

    function isMarkdownFilename(filename) {
        return /\.md$/i.test(filename || "");
    }

    function readJsonResponse(response) {
        return response.text().then(function (text) {
            if (!text) {
                return {};
            }

            try {
                return JSON.parse(text);
            } catch (error) {
                return { message: text };
            }
        });
    }

    if (secretInput) {
        secretInput.value = readStoredSecret();
    }

    openButton.addEventListener("click", function () {
        setStatus("");
        toggleModal(true);
    });

    for (var i = 0; i < closeButtons.length; i += 1) {
        closeButtons[i].addEventListener("click", function () {
            toggleModal(false);
        });
    }

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            toggleModal(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            toggleModal(false);
        }
    });

    fileInput.addEventListener("change", function () {
        if (!filenameInput.value && fileInput.files && fileInput.files[0]) {
            filenameInput.value = fileInput.files[0].name;
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        setStatus("");

        var file = fileInput.files && fileInput.files[0];

        if (!file) {
            setStatus("Selecione um arquivo .md.", "error");
            return;
        }

        if (!isMarkdownFilename(file.name)) {
            setStatus("O arquivo precisa ter extensão .md.", "error");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";
        }

        try {
            var markdown = await file.text();
            var selectedFilename = filenameInput.value.trim() || file.name;
            var payload = {
                filename: selectedFilename,
                markdown: markdown,
                overwrite: !!overwriteInput.checked,
                season: seasonInput.value || "summer"
            };

            if (titleInput.value.trim()) {
                payload.title = titleInput.value.trim();
            }

            if (tagsInput.value.trim()) {
                payload.tags = tagsInput.value.trim();
            }

            if (secretInput && secretInput.value.trim()) {
                payload.uploadSecret = secretInput.value.trim();
            }

            var response = await fetch("/api/upload-note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            var responseData = await readJsonResponse(response);

            if (!response.ok) {
                throw new Error(responseData.message || "Falha ao enviar a nota.");
            }

            storeSecret(secretInput ? secretInput.value.trim() : "");
            setStatus("Upload concluído com sucesso.", "success", responseData.commitUrl);

            form.reset();
            seasonInput.value = "summer";
            if (secretInput) {
                secretInput.value = readStoredSecret();
            }
        } catch (error) {
            setStatus(error.message || "Não foi possível enviar a nota.", "error");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = defaultSubmitLabel;
            }
        }
    });
}());
