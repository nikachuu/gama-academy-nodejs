/*

 vamos instalar o modulo do mongodb
// npm install mongodb
// c:/ arquivos de programa/mongodb/server/4.0/bin
apertar Windows + Pause
//1o terminal: mongod
//2o terminal: mongo

// para listar bancos de dados: show dbs
// alteramos o contexto para o banco selecionado
// se ele nao existir, quando inserir um novo dado ele criará automaticamente
// use nomeDoBanco
// use caracteres

// para listar colecoes (tabelas)
// show collections

// para inserir um novo item: 
    db.nomeDaColecao.insert({
        nome: 'teste',
        idade: 123
    })
// para listar:
    db.nomeDaColecao.find()
    db.nomeDaColecao.find({ nome: 'teste' })

// roda funcoes javascript:
    for(i=0; i<1000; i++){
        db.caracteres.insert({ nome: 'teste' + i })
    }
*/
const { MongoClient } = require('mongodb');

class HeroiDB {
    constructor() {
        this.heroiCollection = {}
    }

    async connect() {
        // para conectar com o mongodb local
        // localhost:27017/<dbName>
        const mongodbString = 'mongodb://localhost:27017/heroi'
        const mongoClient = new MongoClient(mongodbString, { useNewUrlParser: true });
        const connection = await mongoClient.connect();
        const heroiCollection = await connection.db('caracteres').collection('heroi');
        // adicionamos o heroi para a instancia da classe
        this.heroiCollection = heroiCollection;
    }

    async cadastrar(heroi) {
        return this.heroiCollection.insertOne(heroi);
    }

    async listar(heroi, skip = 0, limit = 10) {
        //skip: quantidade que vai ignorar
        //limit: quantidade de itens do banco que ele pode trazer, para evitar gastos excessivos de processamento da aplicação trazendo coisas que podem por ventura não ser utilizadas
        let filtro = {};
        if (heroi.nome) {
            // heroi.nome pode estar em qualquer lugar do filtro, e o options i remove a case sensitivity
            // mais adequado tratar o filtro aqui, pois se não teria que ser tratado em todos os Fronts que utilizassem esse serviço
            filtro = { nome: { $regex: `.*${heroi.nome}*.`, $options: 'i' } }
        }
        return this.heroiCollection.find(filtro).skip(skip).limit(limit).toArray();
    }

    async remover(id) {
        return await this.heroiCollection.deleteOne({ _id: id });
    }

    async atualizar(idHeroi, heroiAtualizado) {
        // o primeiro parametro é o filtro, o segundo é o que substituirá o arquivo
        // se esquecer de mandar o operador correto, vai perder o dado
        // tem que lembrar de passar sempre: $set: dado -> ESQUECEU O SET -> VAI PERDER!
        return this.heroiCollection.updateOne(
            {
                _id: idHeroi
            }, 
            {
                $set: heroiAtualizado 
            });
    }
}

//exportamos o modulo
module.exports = HeroiDB;

// async function main() {
//     const heroi = new HeroiDB();
//     const { heroiCollection } = await heroi.connect();
//     await heroiCollection.insertOne({
//         nome: 'Flash',
//         poder: 'Velocidade',
//         idade: 20
//     });
//     const items = await heroiCollection.find().toArray();
//     console.log(items);
// }

// main();