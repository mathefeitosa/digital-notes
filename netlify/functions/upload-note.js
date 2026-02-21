const GITHUB_API_BASE = "https://api.github.com";
const FRONT_MATTER_PATTERN = /^---\s*\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;
const ALLOWED_SEASONS = new Set(["summer", "spring", "winter"]);
const MAX_MARKDOWN_SIZE_BYTES = 1_000_000;

const defaultHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function response(statusCode, payload) {
    return {
        statusCode,
        headers: defaultHeaders,
        body: JSON.stringify(payload)
    };
}

function encodePath(path) {
    return path
        .split("/")
        .map(function (segment) {
            return encodeURIComponent(segment);
        })
        .join("/");
}

function sanitizeFilename(rawFilename) {
    if (typeof rawFilename !== "string") {
        return null;
    }

    var filename = rawFilename
        .trim()
        .replace(/\\/g, "/")
        .split("/")
        .pop()
        .replace(/\s+/g, " ")
        .replace(/[\0\r\n]/g, "")
        .trim();

    if (!filename || filename === "." || filename === "..") {
        return null;
    }

    if (!/\.md$/i.test(filename)) {
        filename += ".md";
    }

    if (filename.startsWith(".") || /[<>:"|?*]/.test(filename)) {
        return null;
    }

    return filename;
}

function normalizeTitle(rawTitle, fallbackFilename) {
    if (typeof rawTitle === "string" && rawTitle.trim()) {
        return rawTitle.trim();
    }

    return fallbackFilename
        .replace(/\.md$/i, "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeTags(rawTags) {
    var tags = [];
    var source = rawTags;

    if (typeof source === "string") {
        source = source.split(",");
    }

    if (!Array.isArray(source)) {
        return tags;
    }

    for (var i = 0; i < source.length; i += 1) {
        var tag = String(source[i] || "").trim();
        if (!tag) {
            continue;
        }
        if (!tags.includes(tag)) {
            tags.push(tag);
        }
    }

    return tags;
}

function escapeYamlString(value) {
    return "\"" + value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
}

function ensureFrontMatter(markdown, metadata) {
    var normalizedContent = String(markdown || "").replace(/^\uFEFF/, "");
    if (FRONT_MATTER_PATTERN.test(normalizedContent)) {
        return normalizedContent;
    }

    var lines = [
        "---",
        "title: " + escapeYamlString(metadata.title),
        "tags: [" + metadata.tags.map(escapeYamlString).join(", ") + "]",
        "season: " + metadata.season,
        "---",
        ""
    ];

    return lines.join("\n") + normalizedContent;
}

async function parseBody(event) {
    if (!event.body) {
        return {};
    }

    var bodyText = event.body;
    if (event.isBase64Encoded) {
        bodyText = Buffer.from(bodyText, "base64").toString("utf8");
    }

    return JSON.parse(bodyText);
}

async function readJson(responseObject) {
    var text = await responseObject.text();
    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return { message: text };
    }
}

async function githubRequest(path, token, options) {
    var requestOptions = options || {};
    var headers = Object.assign({}, requestOptions.headers || {}, {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28"
    });

    return fetch(GITHUB_API_BASE + path, Object.assign({}, requestOptions, { headers: headers }));
}

exports.handler = async function (event) {
    if (event.httpMethod === "OPTIONS") {
        return response(200, { ok: true });
    }

    if (event.httpMethod !== "POST") {
        return response(405, { message: "Method not allowed." });
    }

    var githubToken = process.env.GITHUB_TOKEN;
    var githubOwner = process.env.GITHUB_OWNER;
    var githubRepo = process.env.GITHUB_REPO;
    var githubBranch = process.env.GITHUB_BRANCH || "main";
    var uploadSecret = process.env.UPLOAD_SECRET;

    if (!githubToken || !githubOwner || !githubRepo) {
        return response(500, {
            message: "Missing environment variables: GITHUB_TOKEN, GITHUB_OWNER or GITHUB_REPO."
        });
    }

    var payload;
    try {
        payload = await parseBody(event);
    } catch (error) {
        return response(400, { message: "Invalid JSON body." });
    }

    if (uploadSecret && payload.uploadSecret !== uploadSecret) {
        return response(401, { message: "Invalid upload secret." });
    }

    var filename = sanitizeFilename(payload.filename || "");
    if (!filename) {
        return response(400, { message: "Invalid filename. Use a valid .md file name." });
    }

    var markdown = String(payload.markdown || "");
    if (!markdown.trim()) {
        return response(400, { message: "Markdown content is empty." });
    }

    if (Buffer.byteLength(markdown, "utf8") > MAX_MARKDOWN_SIZE_BYTES) {
        return response(413, { message: "Markdown file is too large (max 1 MB)." });
    }

    var season = String(payload.season || "summer").trim().toLowerCase();
    if (!ALLOWED_SEASONS.has(season)) {
        season = "summer";
    }

    var tags = normalizeTags(payload.tags);
    var title = normalizeTitle(payload.title, filename);
    var contentToCommit = ensureFrontMatter(markdown, {
        title: title,
        tags: tags,
        season: season
    });

    var notePath = "_notes/" + filename;
    var encodedPath = encodePath(notePath);
    var overwrite = Boolean(payload.overwrite);
    var existingSha = null;

    var readFileResponse = await githubRequest(
        "/repos/" + encodeURIComponent(githubOwner) + "/" + encodeURIComponent(githubRepo) +
            "/contents/" + encodedPath + "?ref=" + encodeURIComponent(githubBranch),
        githubToken,
        { method: "GET" }
    );

    if (readFileResponse.status === 200) {
        var existingFileData = await readJson(readFileResponse);
        existingSha = existingFileData.sha;

        if (!overwrite) {
            return response(409, {
                message: "A file with this name already exists. Enable overwrite to replace it.",
                filePath: notePath
            });
        }
    } else if (readFileResponse.status !== 404) {
        var readError = await readJson(readFileResponse);
        return response(502, {
            message: "Could not check existing file on GitHub.",
            details: readError.message || "Unknown error."
        });
    }

    var commitPayload = {
        message: existingSha ? "chore(notes): update " + filename : "chore(notes): add " + filename,
        content: Buffer.from(contentToCommit, "utf8").toString("base64"),
        branch: githubBranch
    };

    if (existingSha) {
        commitPayload.sha = existingSha;
    }

    var commitResponse = await githubRequest(
        "/repos/" + encodeURIComponent(githubOwner) + "/" + encodeURIComponent(githubRepo) +
            "/contents/" + encodedPath,
        githubToken,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(commitPayload)
        }
    );

    var commitData = await readJson(commitResponse);

    if (!commitResponse.ok) {
        return response(502, {
            message: "Could not commit note to GitHub.",
            details: commitData.message || "Unknown GitHub API error."
        });
    }

    return response(existingSha ? 200 : 201, {
        message: existingSha ? "Note updated successfully." : "Note created successfully.",
        filePath: notePath,
        branch: githubBranch,
        commitSha: commitData.commit ? commitData.commit.sha : "",
        commitUrl: commitData.commit ? commitData.commit.html_url : "",
        overwrite: existingSha ? true : false
    });
};
