module.exports = function InappropriateResourceError(message = 'Este recurso não pertence ao usuário.') {
    this.name = 'InappropriateResourceError';
    this.message = message;
};