// para instalar pacotes externos, usamos a ferramenta NPM (Node Package Manager) ou YARN (foi criado pelo facebook para ser mais performático)

// para iniciar um projeto node.js, precisamos de um arquivo que define os pacotes. Quando outra pessoa precisar acessar o seu código, este arquivo lhe ensina como instalar ou quais versões sao suportadas
// para iniciar um projeto:
//  npm init
//  -> -y => não precisa de wizard

// para trabalhar com programas de linha de comando, usaremos o Commander
// npm install commander
// --save: nao precisa mais, o npm install ja salva nas dependencias do package json automaticamente :OOOOO
// --save-dev-> ferramentas como transpiladores, testes, ferramentes para diminuir o tamanho do arquivo: ele sim as vezes precisa, pois gera um código de saída pq nao necessariamente voce precisa dessas dependencias em produção
//importamos o heroi
const Heroi = require('./src/heroiEntidade');
const Commander = require('commander');
const HeroiDbArquivo = require('./src/heroiDbArquivo');
// instalar a extensao Path Intelisense
// importamos o commander
const commander = Commander
                    .version('v1.0')
                    .option('-n, --nome [value]', 'O nome do Herói')
                    .option('-i, --idade [value]', 'A idade do Herói')
                    .option('-I, --id [value]', 'O ID do Herói')
                    .option('-p, --poder [value]', 'O poder do Herói')
                    //definimos opcoes para utilizar de acordo com a chamada do cliente
                    .option('-c, --cadastrar', 'deve cadastrar um Heroi')
                    .option('-a, --atualizar [value]', 'deve atualizar um Heroi')
                    .option('-r, --remover', 'deve remover um Heroi')
                    .option('-l, --listar', 'deve remover Herois')
                    .parse(process.argv);

async function main () {
    const dbArquivo = new HeroiDbArquivo;
    //retorna um heroi somente com o que a gente precisa, ignora todas as funções que são desnecessarias de commander
    const heroi = new Heroi(commander);
    // node index.js --cadastrar ou -c
    /* 
        node index.js
        --nome Flash
        --poder Velocidade
        --idade 90
        --cadastrar
        // Chamou cadastrar! Heroi { id: undefined, nome: true, idade: undefined, poder: true }: porque nao tem [value] na frente do --option
    */
    if (commander.cadastrar){
        await dbArquivo.cadastrar(heroi);
        console.log('Heroi cadastrado com sucesso!');
        return;
    }
    if (commander.listar){
        // no JavaScript atualmente usamos dois tipos de variáveis
        // temos const e let
        // const = valores que nunca se alteram
        // let = valores que podem ser alterados
        let filtro = {};
        if (heroi.nome) {
            filtro = { nome: heroi.nome }
        }
        const herois = await dbArquivo.listar(filtro);
        console.log('Heróis:', JSON.stringify(herois));
        return;
    }
    /* 
        node index.js
        --nome fl
        --listar
    */
    if (commander.remover){
        const id = heroi.id;
        if (!id) {
            throw new Error('Você deve passar o ID do Herói!')
        }
        await dbArquivo.remover(id)
        console.log('Herói removido com sucesso!')
        return;
    }
    /*
        node index.js \
        --id 1562880597039 \
        --remover \
    */

    if (commander.atualizar){
        const { id } = heroi;
        // para não atualizar o id, vamos remover
        delete heroi.id;
        await dbArquivo.atualizar(id, heroi)
        console.log('Heroi atualizado com sucesso!');
        return;
    }
    /*  
        node index.js
        --nome Flash
        --poder Força
        --id 1562880597039
        --atualizar
    */
}

main();