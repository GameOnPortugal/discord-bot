# discord-bot

Bot oficial do Discord Playstation portugal

## Como usar

Localmente basta preencher o ficheiro .env com os dados necessários

Construir os containers através do comando `make run`

## ESlint

Estamos a usar o ESLint para manter algumas regras de estrutura comum a todos os programadores
bem como verificar rapidamente por algum problema potencial.

Para validar estas regras pode usar o comando `make eslint`

Para corrigir automaticamente alguns destes problemas, como regras de apresentação podem
correr o comando `make eslint-fix`


## Base de dados

Estamos a usar `sequelize` para gerir a base de dados. 
A documentação pode ser encontrada aqui: https://sequelize.org/master/manual/getting-started.html

Estamos a usar para desenvolvimento o sequelize-ci e uns bons exemplos podem ser encontrados aqui: https://sequelize.org/master/manual/migrations.html

### Rodar as migracoes

`npx sequelize-cli db:migrate`

`npx sequelize-cli db:migrate:undo`

Em produção podemos rodar as migracoes atribuindo o parametero --url por exemplo:

`npx sequelize-cli db:migrate --url 'mysql://user:pass@db/db?reconnect=true'`

### Criar um novo modelo

`npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string`

### Criar o primeiro "Seed"

`npx sequelize-cli seed:generate --name demo-user`

```javascript
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      firstName: 'John',
      lastName: 'Doe',
      email: 'example@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
```
