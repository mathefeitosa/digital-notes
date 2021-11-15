---
title: Aprendendo Python
tags: [programação, python]
toc: true
season: summer
---
# Aprendendo Python

# Anotações

*   Podemos passar um loop por uma *string* de forma fácil

```python
for x in 'string':
	print(x)
```

*   Podemos aumentar uma string através de uma multiplicação

```python
print('olá' * 8)
```

*   Podemos salvar a saída de um código em outro arquivo

```sh
$ python script.py > saida.txt
```

*   Um arquivo python que irá ser usado como um script executável (assim como os arquivos do bash) tem a primeira linha especial, chamada de **shebang** ou **hash-bang**  (o simbolo #!) que contém o **PATH** do interpretador **python**

```python
#!/usr/local/bin/python
print('The bright side ' + 'of Life...')
```

*   Podemos usar o programa *env* para localizar para nós o python ao invés de usarmos um PATH específico no comentário da primeira linha

```python
#! /usr/local/bin/env python
print('The bright side ' + 'of Life...')
```

*   Para fazer o programa ser um executável de clique duplo existem estratégias diferentes para cada sistema operacional
    *   Linux:
        1.  Registrar a extensão .py no explorador de arquivos como executável
        2.  Fazer o script encontrar o seu interpretador através de `#! /local/do/python` no inicio do arquivo
        3.  Pode associar um tip de MIME (arquivo) à um programa, neste caso associar ao python.
*   Qualquer código fonte em python deve ter a extensão `.py`.
    *   Mesmo se for um módulo/biblioteca.
*   Importar um arquivo implica em executar todo o código que está dentro dele.
    *   Sendo assim, importar um arquivo pode ser uma forma de executa-lo, porém somente na primeira importação do arquivo.
- Para forçar o python a recarregar um módulo faça o seguinte
	- Não é possível usar se o módulo não tiver já sido importado
	- Essa função não recarrega os módulos importados pelo módulo recarregado.
```python
import some_library_or_code #first load
from imp import reload #só para o python 3.x

reload(some_library_or_code)
```

- Separar duas variáveis com uma vírgula cria uma *tupple*:
```python
a_tupple = "cachorro", "cavalo"
```
- Cada módulo tem o seu *namespace* e não pode enxergar outros módulos, a não ser que ele os importe.
- *Frozen Binary Executables* são formas de combinar o *byte code* e o interpretador de python para criar um único programa executável.
	- É mais utilizado para a forma final do programa, e não durante o desenvolvimento.

## Object Types
- Em python os dados tem forma de objetos.
- Em python tudo é um objeto.
## Hierarquia
- Programas são feito de módulos.
- Modulos contém declarações.
- Declarações contem expressões.
- expresões criam e processam objetos.
Programas -> Módulos -> Declarações -> Expressões
# Funções
## Métodos de strings
- Esses métodos ficam embutidos dentro de qualquer objeto string e pode ser acessado com a notação *dot*: `string.method()`
### string.split(delimiter)
- Cria uma _list_ a partir de uma string e usa otra string como o separador.
### string.capitalize()
- Converte o primeiro caractere da _string_ para letra maíuscula
### string.casefold()
- Faz o mesmo que o [[notes/Aprendendo Python#^bde659|lower()]].
- Retorna uma _string_ com todos os valores em letras minúsculas, só que todas mesmo.
### string.lower() ^bde659
- Retorna uma _string_ com todos os valores em letras minúsculas.
### string.center(length, character)
- Centraliza uma string colocando caracteres ao redor
- Parâmetros
	- **length**: quantidade de repetições de cada lado
	- **character**: o que será usado para preencher (opcional)

### string.count(value, start, end)
- Retorna o número de vezes que uma *string* (value) aparece na *string*.
### string.encode(encoding=encoding, errors=errors)
- Codifica a string para uma codificação determinada.
- Parâmetros
	- **encoding**: 'utf-8', 'ascii'...
	- **errors**:
		- 'backslashreplace'	- uses a backslash instead of the character that could not be encoded
		- 'ignore'	- ignores the characters that cannot be encoded
		- 'namereplace'	- replaces the character with a text explaining the character
		- 'strict'	- Default, raises an error on failure
		- 'replace'	- replaces the character with a questionmark
		- 'xmlcharrefreplace'	- replaces the character with an xml character

### string.endswith(value, start, end)
- The endswith() method returns True if the string ends with the specified value, otherwise False.
- Parameters

| Parameter | Description |
| --------- | ----------- |
| **value**	| Required. The value to check if the string ends with|
| **start**	| Optional. An Integer specifying at which position to start the search end	|

### string.expandtabs(tabsize)
- Expande os tabs de um texto para espaços - tabs marcados com `\t`
```python
txt = "H\te\tl\tl\to"
txt.expandtabs(4)
```
### string.find(value, start, end)
- Encontra e retorna a posição da *string* em uma *string*
- É o mesmo que o [[notes/Aprendendo Python#^5c5012|index()]] só que aqui se não encontrado não devolve um erro, e sim o valor -1.
### string.index(value, start, end) ^5c5012
- Se não encontrado causa um erro.
- Localiza e retorna a posição da ***string*** na string.
## input()
*   Imprime o argumento (string) antes de ler a proxima linha do console (digitada)
*   Retorna a linha lida

```python
nome = input("Qual é o seu nome?")
```
## dir(module)
- Retorna uma *list* de string com todos os nomes disponíveis dentro de um módulo.
## exec(open('script.py').read())
- Permite executar um arquivo *script* sem precisar importalo ou recarregalo.
- Atenção: esse método pode sobrescrever variáveis que você estiver usando no código.
## random.choice(list)
- Função da biblioteca `random` que retorna aleatóriamente alguma coisa em uma lista.

# Tipos de dados
- Dados imutáveis: _**numbers**, **strings** and **tuples**_
- Dados mutáveis: _**lists**, **dictionaries** and **sets**_

# Bibliotecas
## wordninja
- Separa palavras que estão juntas em uma string e sem espaço.
- `pip install wordninja`
```python
>>> import wordninja
>>> wordninja.split('derekanderson')
['derek', 'anderson']
```