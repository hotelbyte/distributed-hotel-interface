
module.exports = () => {
    window.prompt = () => {
        console.warn('DHI doesn\'t support window.prompt()');
    };
};
