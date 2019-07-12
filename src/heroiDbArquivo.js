// importamos o modulo para trabalhar com arquivos
const { exists, promises: { writeFile, readFile } } = require('fs');

// o exists não existe na promises API, precisamos converter manualmente
// -> o exists não segue o padrão callback, então não conseguimos usar o promisify nele
//1o: importar o exists padrão
//2o: converter para promise
const existsAsync = (parametro) => new Promise((resolve, reject) => {
    exists(parametro, existe => resolve(existe))
})

class HeroiDbArquivo {
    constructor() {
        this.NOME_ARQUIVO = 'herois.json';
    }

    async _obterArquivo() {
        //verificamos se o arquivo existe antes de acessar seu conteúdo
        if(! await existsAsync(this.NOME_ARQUIVO)){
            return [];
        }
        //lemos o arquivo no diretório e convertemos para JSON
        const texto = await readFile(this.NOME_ARQUIVO);
        return JSON.parse(texto);
    }

    async _escreverArquivo(dado) {
        //pegamos o dado no formato objeto javascript e convertemos para texto com a função abaixo
        const dadoTexto = JSON.stringify(dado);
        await writeFile(this.NOME_ARQUIVO, dadoTexto);
        return;
    }

    async cadastrar(heroi){
        //obtemos os herois
        const herois = await this.listar();
        //criar um id baseado na hora
        heroi.id = Date.now();
        herois.push(heroi);
        await this._escreverArquivo(herois);
        return;
    }
    //vamos definir que o filtro é opcional
    async listar(filtro = {}){
        // caso o cliente não filtrar dados, retornamos todos os itens
        if (!Object.keys(filtro).length) {
            return await this._obterArquivo();
        }

        const dados = await this._obterArquivo();
        // para entrar em cada item da lista:
        // para cada item, chamaremos uma função
        // caso a asserção for verdadeira, ele continua no array
        const dadosFiltrados = dados.filter(heroi => ~heroi.nome.toLowerCase().indexOf(filtro.nome.toLowerCase()))
        return dadosFiltrados;
    }

    async remover(idHeroi) {
        const dados = await this._obterArquivo();
        const dadosFiltrados = dados.filter(({id}) => id !== parseInt(idHeroi));
        return await this._escreverArquivo(dadosFiltrados);
    }

    async atualizar(idHeroi, heroiAtualizado){
        const dados = await this._obterArquivo();
        // procuramos a posição que o heroi está
        const indiceHeroiAntigo = dados.findIndex(({id}) =>  id === parseInt(idHeroi));
        if (indiceHeroiAntigo === -1) {
            throw new Error("O Herói não existe! =(");
        }
        const atual = dados[indiceHeroiAntigo];
        //removemos o item da lista
        // o segundo parametro do splice fala quantos indices é para serem removidos
        dados.splice(indiceHeroiAntigo, 1);
        // para remover todas as chaves que estejam vazias (undefined), precisamos converter o objeto para string e depois para objeto novamente
        // NÃO FAZER ISSO EM CASA (SEGUNDO ERICK HUAHAUHAUA)
        const objTexto = JSON.stringify(heroiAtualizado);
        const objFinal = JSON.parse(objTexto);
        const heroiAlterado = {
            ...atual,
            ...objFinal
        };
        const novaLista = [
            ...dados,
            heroiAlterado
        ];
        return await this._escreverArquivo(novaLista);
    }
}

// testamos a classe
// LEMBRAR DE COMENTAR DEPOIS
// async function main() {
//     const minhaClass = new HeroiDbArquivo();
//     const dado = await minhaClass.listar({
//         nome: 'bat'
//     })
//     console.log(dado);
// }

// main();

module.exports = HeroiDbArquivo;