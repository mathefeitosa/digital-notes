---
title: Truques - Ubuntu
tags: [ubuntu, linux, debian, dicas, truques]
toc: true
season: summer
---

# Gerar OCR de PDF
## Installation
Linux, UNIX, and macOS are supported. Windows is not directly supported but there is a Docker image available that runs on Windows.
Users of Debian 9 or later or Ubuntu 16.10 or later may simply
```apt-get install ocrmypdf```
and users of Fedora 29 or later may simply
```dnf install ocrmypdf```
and macOS users with Homebrew may simply
```brew install ocrmypdf```
## Usage
Quick convert a single pdf document
ocrmypdf input.pdf output.pdf
Convert all pdf files in a folder
```bash
for f in ./*.pdf; do ocrmypdf "$f" "$(basename "$f" ".pdf")_ocr.pdf"; done
```

# Mudar o volume através de comandos
```bash
# Aumentar o volume
$ amixer -q set Master 5%+ unmute
# Diminuir o volume
$ amixer -q set Master 5%- unmute
```

- Usando o pactl e para todas as saídas
```bash
$ pactl set-sink-volume @DEFAULT_SINK@ -5%
$ pactl set-sink-volume @DEFAULT_SINK@ +5%
```

# Fazer o audio trocar automaticamente para os fones
## Forma 1
- Executar esse comando que carrega o módulo do pulse:
```bash
$ pacmd load-module module-switch-on-connect
```
- Depois colocar a linha abaixo no arquivo `/etc/pulse/default.pa`
```bash
$ load-module module-switch-on-connect
```

## Forma 2
```bash
$ sudo apt-add-repository ppa:yktooo/ppa
$ sudo apt update && sudo apt install indicator-sound-switcher
```


# Trocar o brilho do monitor pelo *shell*
- Descobrir qual o nome do dispositivo
	- `xrandr -q | grep "connected"`
- Mudar o brilho de acordo com o dispositivo \<device>
	- `xrandr --output <device> --brightness 0.5`
	- Exemplo: `xrandr --output HDMI-A-0 --brightness 0.5`
- O valor de `--brightness` vai de 0 a 1 —  onde 1 é 100%.