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
const HeroiMongoDb = require('./src/heroiDb');
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

async function main() {
    try {
        
        const dbArquivo = new HeroiDbArquivo();
        const dbMongo = new HeroiMongoDb();
        await dbMongo.connect();
        console.log("Mongo conectado");
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
            await dbMongo.cadastrar(heroi);
            console.log('Heroi cadastrado com sucesso!');
            process.exit(0);
            return;
        }

        if (commander.listar){
            // no JavaScript atualmente usamos dois tipos de variáveis
            // temos const e let
            // const = valores que nunca se alteram
            // let = valores que podem ser alterados
            // FILTRO VAI PRO SERVIÇO, NAO É ADEQUADO FICAR NO BACKEND
            const herois = await dbMongo.listar(filtro);
            console.log('Heróis:', JSON.stringify(herois));
            process.exit(0);
            return;
        }
        /* 
            node index.js
            --nome fl
            --listar
        */
        if (commander.remover){
            const id = heroi._id;
            if (!id) {
                throw new Error('Você deve passar o ID do Herói!')
            }
            await dbMongo.remover(id)
            console.log('Herói removido com sucesso!')
            process.exit(0);
            return;
        }
        /*
            node index.js \
            --id 1562880597039 \
            --remover \
        */

        if (commander.atualizar) {
            const { _id } = heroi;
            if (!_id) {
                throw new Error("O ID é obrigatório!")
            }
            // para nao atualizar com o _id
            delete heroi._id;
            // gambeta do bem, para remover as chaves undefined/null
            const heroiFinal = JSON.parse(JSON.stringify(heroi));
            const resultado = await dbMongo.atualizar(_id, heroiFinal);
            console.log('Heroi atualizado com sucesso!', console.log(resultado));
            process.exit(0);
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
    catch(error) {
        console.error('DEU RUIM', error)
        process.exit(0);
    }
}

async function mainE() {
    try {
      const dbArquivo = new HeroiDbArquivo();
      const dbMongo = new HeroiMongoDb();
      await dbMongo.connect();
      console.log('mongo conectado!');
  
      const heroi = new Heroi(commander);
  
      // node index.js --cadastrar
      // node index.js -c
      /*
      node index.mongo.js \
          --nome Flash \
          --poder Velocidade \
          --idade 80 \
          --cadastrar
      */
      if (commander.cadastrar) {
        await dbMongo.cadastrar(heroi);
        console.log('Heroi cadastrado com sucesso!');
        // falamos para o node que terminamos nossa tarefa
        process.exit(0);
        return;
      }
      /**
       node index.mongo.js \
         --nome fl \
         --listar
       */
      if (commander.listar) {
        // no java atualmente usamos dois tipos de variaveis
        // -> const -> valores que nunca se alteram
        // const v1 = 0
        // v1 = 3 // erro
  
        // -> let -> valores que podem ser alterados
        // let v1 = 0
        // v1 = 3 // da bom
        let filtro = {};
        if (heroi.nome) {
          // usamos um operador do MongoDB
          // para filtrar para filtrar frases que
          // que contenham aquele texto
          filtro = {
            nome: {
              $regex: `.*${heroi.nome}*.`,
              $options: 'i',
            },
          };
        }
        const herois = await dbMongo.listar(filtro);
        console.log('herois', JSON.stringify(herois));
        process.exit(0);
        return;
      }
  
      /*
      node index.mongo.js \
      --id 1562880485630 \
      --remover
      */
      if (commander.remover) {
        const id = heroi._id;
        if (!id) {
          throw new Error('Voce deve passar o ID');
        }
        await dbMongo.remover(id);
        console.log('Heroi removido com sucesso!');
        process.exit(0);
        return;
      }
      /*
      node index.mongo.js \
       --nome Batman \
       --poder Ricao \
       --id 5d27c81f65ef2d409618cbd2 \
       --atualizar
      */
      if (commander.atualizar) {
        const { _id } = heroi;
        if(!_id) {
            throw new Error('o id é obrigatorio')
        }
        // para nao atualizar com o _id
        console.log(_id);
        delete heroi._id;
        // gambeta do bem, para remover as chaves undefined
        const heroiFinal = JSON.parse(JSON.stringify(heroi));
        console.log('heroi final: ', heroiFinal)
        await dbMongo.atualizar(_id, heroiFinal);
        console.log('Heroi atualizado com sucesso!');
        process.exit(0);
        return;
      }
    } catch (error) {
      console.error('DEU RUIM', error);
      process.exit(0);
    }
}

main();