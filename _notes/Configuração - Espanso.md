---
title: Configuração - Espanso
tags: [programa, digitação, dica, expansor-de-texto]
toc: true
season: automn
---
# Espanso
Site: [Espanso](https://espanso.org/)

# Sobre
O espanso é um expansor de texto onde você pode colocar atalhos de teclado que inserem trechos de texto pré-definidos no cursor de texto atual.

- Alterar as configurações no arquivo
	- Windows: `C:\Users\{usuário}\AppData\Roaming\espanso\default.yml`


```yml
# Templates for taking notes - Obsidian
  # Template - Person
  - trigger: ":pessoa"
    replace: "# Nome\ntags: #pessoas\n\n---\n# Sobre\n# Ideias\n# Feitos"

  # Template - Ano
  - trigger: ":ano"
    replace: "# Ano\ntags: #ano\n\n---\n# Eventos"
  
  # Template - Livro
  - trigger: ":livro"
    replace: "# Título\ntags: #livro\nautor:\npublicação:\n\n---\n# Conteúdo\n# Notas"

  # Template - Palavras
  - trigger: ":palavra"
    replace: "# Palavra\ntags:\n#significados\n\n---\n# Significado\n# Origem"
```