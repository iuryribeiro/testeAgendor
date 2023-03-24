const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/endpoint', (req, res) => {
  const data = req.body;
  // console.log(data);
  const empresa = data['empresa'];
  const nome = data['name'];
  const email = data['email'];
  const cargo = data['cargo'];
  const vendedores = data['qtdVendedores'];
  


  

  if(vendedores == '4 ou mais' && cargo == 'Gestor de Vendas'){
    
    console.log('entrou no if');

    //Criação empresa
    const credential = '2eaa325a-4b3b-41fe-81a6-185338064b68';
    
    const novaEmpresa = {

        name : empresa,
        customFields:  {
            qtd_de_vendedores:vendedores
          }
        

    }
  

     async function criarEmpresa() {
      try {
        const response = await fetch('https://api.agendor.com.br/v3/organizations/upsert', {
          method: 'POST',
          headers: {
            'Authorization': 'Token ' + credential,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(novaEmpresa)
        });
        
        const data = await response.json();
        // console.log(data);
        
        const idOrganizacao = data.data.id;

        return idOrganizacao;
        
      } catch (error) {
        console.error(error);
      }
    }


//Função para criar pessoa
    async function criarPessoa() {
      try {
          //Criando Pessoa puxando os campos
                const novoContato = {
                  name:nome,
                  contact:{
                    email:email
                  },
                  organization: await criarEmpresa(),
                  customFields:  {
                    cargo:cargo
                  }
              }

        const response = await fetch('https://api.agendor.com.br/v3/people/upsert', {
          method: 'POST',
          headers: {
            'Authorization': 'Token ' + credential,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(novoContato)
        });
        
        const data = await response.json();
        // console.log(data);

        const idPerson = data.data.id;

        return novoContato.organization;
      } catch (error) {
        console.error(error);
      }
    }



  //função para acessar o Negocio
    async function criarNegocio() {
      try {
          //Criando Negocio
                const novoNegocio = {
                  title:empresa,
              }

          const idOrganizacao = await criarPessoa();

        const response = await fetch('https://api.agendor.com.br/v3/organizations/'+ idOrganizacao +'/deals', {
          method: 'POST',
          headers: {
            'Authorization': 'Token ' + credential,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(novoNegocio)
        });
        
        const data = await response.json();
        // console.log(data);
        res.send('Importação realizada com Sucesso');
      } catch (error) {
        console.error(error);
      }
    } 

  
    criarNegocio();


}else{
  res.send('A empresa não se encaixa nos parametros');
}
  
});





const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));