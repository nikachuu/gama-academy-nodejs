// vamos importar a biblioteca padrão do node.js para trabalhar com requisicoes Web
// const http = require('http');
// http.createServer((req, res) => {
//     // res.end aparecerá no Browser, através do localhost:3000, que é a porta que ele ta escutando
//     res.end('Hello world! :D')
// }).listen(3000, () => console.log('Server rodando.'));

/*
    Vamos trabalhar com o padrão REST
    REST x RESTFUL: restful é totalmente o padrão do REST
    -> Trabalhamos com JSON: JavaScript Object Notation: muito mais leve do que trabalhar com outras formas de comunicação, como XML
    -> O Rest é basicamente um PADRÃO/CONVENÇÃO de APIs, não é um framework.

    AÇÃO        MÉTODO      URL
    Cadastrar   POST       /v1/herois
    Atualizar   PUT ou     /v1/herois/:id   -> usado para substituir TODA informação original
    *           PATCH                       -> usado para atualização parcial
    Remover     DELETE     /v1/herois/:id
    Listar      GET        /v1/herois?skip=0&limit=10&nome=e
    *           *          /v1/herois/:id/habilidades/:id

    npm i hapi

    para evitar ficar fazendo IFs validando na mão ( 0, undefined, null = false ), podemos trabalhar com SCHEMAS DE VALIDAÇÃO
    onde validamos o pedido primeiro ANTES de passar pelo nosso HANDLER, com o Joi! :D

    npm i joi

    Utilizamos o Postman para trabalhar com métodos não-GET da API

    Para documentar nossa aplicação automaticamente, vamos usar a lib Swagger
    Para utiliza-la, precisamos seguir alguns passos:
    - 1o: adicionar o plugin Hapi
    - 2o: adicionar tags (api) nas configs de rotas

    npm i hapi-swagger@9.1.3 inert vision
*/
const Db = require('./src/heroiDb');
const Joi = require('joi'); // importado para validação de requisições; toda vez que for usar, adicionar na config.validate da rota
const Hapi = require('hapi'); // para estabelecer nosso servidor
// Swagger são os três abaixo
const HapiSwagger = require('hapi-swagger');
const Vision = require('vision');
const Inert = require('inert');

const app = new Hapi.Server({
    port: 3000
});

async function main() {
    try {
        const database = await new Db();
        await database.connect();
        console.log('Database conectado');
        await app.register({
            
        })
        // vamos definir as rotas
        app.route([
            {
                // localhost:3000/v1/herois?nome=flash
                // localhost:3000/v1/herois?nome=<filtro>&skip=1&limit=2
                path: '/v1/herois',
                method: 'GET',
                // config vai possuir o Schema, que vem do Joi
                config: {
                    validate: {
                        // por padrão, o Hapi não mostra os erros, então manipulamos a função para que eles sejam mostrados
                        failAction: (request, headers, err) => {
                            throw err;
                        },
                        // o que podemos validar: HEADERS, QUERY, PAYLOAD E PARAMS
                        query: {
                            nome: Joi.string().max(10).min(2),
                            skip: Joi.number().default(0),
                            limit: Joi.number().default(10).max(10)
                        }
                    }
                },
                handler: async (request) => {
                    try {
                        // query string = o que vem na URL a gente vai utilizar, para trabalhar na listagem dos dados
                        // de dentro do query, precisamos fazer a separação das informações extras que estão sendo passadas para lidar com os dados que estão sendo recebidos
                        const { query } = request;
                        const { skip, limit } = query;
                        // por padrão, tudo que vem da web está como String... temos que fazer o mapeamento manual pois o mongodb 4 não deixa usar mais string para esse caso
                        return database.listar(query, parseInt(skip), parseInt(limit));
                    }
                    catch (error) {
                        console.error('DEU RUIM', error);
                        return null;
                    }
                }   
            },
            {
                path: '/v1/herois',
                method: 'POST',
                config: {
                    validate: {
                        failAction: (req, header, err) => {
                            throw err;
                        },
                        payload: {
                            nome: Joi.string().max(10).required(),
                            idade: Joi.number().min(18).required(),
                            poder: Joi.string().max(10).required()
                        }
                    }
                },
                handler: async (request) => {
                    try {
                        const { payload } = request;
                        return database.cadastrar(payload);
                    } catch (error) {
                        console.error('DEU RUIM!', error);
                        return null;
                    }
                }
            }
        ]);
        await app.start();
        console.log(`Servidor rodando em localhost:${app.info.port}`);
    }
    catch (e) {
        console.error('DEU RUIM', e);
    }
}

main();