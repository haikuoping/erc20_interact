const QKCToken = artifacts.require("QKCToken")

module.exports = function(developer){
    developer.deploy(QKCToken)
}