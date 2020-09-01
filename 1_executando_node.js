// Funcao sem o padrao arrow function
function helloworld(){
    console.log("Hello world!");
}

// funcao com o padrao arrow function
helloworld2 = () => {
    console.log("Hello world arrow function.");
}

// funcao com o padrao arrow function
const saudacao = () => {
    var data = new Date();
    console.log("Hora atual: " + data.toTimeString());
    // Se hora menor que 12, retorna bom dia. Se não, verifica de a hora é menor que 18, 
    // se for retorna boa tarde, se não for retorna boa noite.
    return data.getHours() <= 12? "Bom dia": data.getHours() <= 18? "Boa tarde": "Boa noite";
}

// Executa a funcao de fato
helloworld();
helloworld2();

console.log("A saudacao do momento eh: " + saudacao());