
test('Nati deve saber sobre as assertivas do jest', () => {

    // let usamos quando queremos alterar o valor da variavel
    // const usamos quando nao queremos alterar o valor
    let number = null;

    // assertiva do jest
    expect(number).toBeNull();

    // forcando um erro
    // let numberError = 11;
    // expect(numberError).toBeNull();

    number = 10;
    expect(number).not.toBeNull();

    // toBe e toEqual sao equivalentes para tipos primitivos
    expect(number).toBe(10);
    expect(number).toEqual(10);

    // Quando nao se sabe exatamente o valor
    expect(number).toBeGreaterThanOrEqual(9);
    expect(number).toBeLessThanOrEqual(11);
    
});

test('Nati deve saber trabalhar com objetos', () => {
    const obj = { name: "Natielle", mail: "nati@gmail.com"};
    expect(obj).toHaveProperty('name');
    
    // verifica o valor da propriedade tambem
    expect(obj).toHaveProperty('name', 'Natielle'); 
    expect(obj.name).toBe('Natielle');

    // vendo a diferenca entre toEqual e toBe
    const obj2 = { name: "Natielle", mail: "nati@gmail.com"};
    // expect(obj).toBe(obj2); // mesmo sendo iguais, nao são os mesmos. Vai dar erro.
    expect(obj).toBe(obj); // Sao os mesmo objetos.
    
    expect(obj).toEqual(obj2); // possuem os mesmos valores
    
});