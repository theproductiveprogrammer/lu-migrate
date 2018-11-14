'use strict'

/*      section/
 * Import all the things!
 */
const path = require('path')
const fs = require('fs')
const read = require('read')
const crypt = require('./crypt')

/*      problem/
 * The 1.0.0 version of luminate uses `scrypt` for password hashing.
 * However `scrypt` does not install properly on windows. The newer
 * verisons of luminate use the core nodejs `crypto` libraries to solve
 * this problem. However older wallets can no longer be read by the new
 * version.
 *
 *      way/
 * Given the path to the wallet accounts, we migrate it to (or from)
 * version 2.0.0.
 */
function main() {
    let acc = process.argv[4]
    if(!acc) return showHelp()
    if(process.argv[2] != '--to') return showHelp()
    if(process.argv[3] == 'v2') migrate2v2(acc)
    else if(process.argv[3] == 'v1') migrate2v1(acc)
    else showHelp()
}

/*      outcome/
 * Load the given account file and migrate it to version 2
 */
function migrate2v2(acc) {
    fs.readFile(acc, 'utf8', (err, data) => {
        if(err) {
            console.error(`Cannot read ${acc} as account file`)
            console.error(err)
        } else {
            try {
                data = JSON.parse(data)
                migrate2_2(data)
            } catch(e) {
                console.error(e)
                console.error(`Unable to understand ${acc} as a wallet account`)
            }
        }
    })

    /*      outcome/
     * Check that the data is a valid v1.0.0 file, get the password and
     * decrypt the secret key, then re-encrypt it as a valid v2.0.0 file.
     */
    function migrate2_2(data) {
        if(data.version && data.version != 'v1') {
            console.error(`${acc} is not a v1.0.0 file`)
            return
        }
        if(!data.label ||
            !data.pub ||
            data.pkg != 'tweetnacl' ||
            !data.nonce ||
            !data.salt ||
            !data.secret) {
            console.error(`${acc} is not a v1.0.0 file`)
            return
        }

        withPassword((pw) => {
            if(!pw) {
                console.error(`Please provide the account password`)
                return
            }
            crypt.password2key(data.salt, pw, (err, key) => {
                if(err) console.error(err)
                else {
                    let secret = crypt.decrypt(data.secret, data.nonce, key)
                    if(!secret) console.error(`Incorrect password`)
                    else {
                        // TODO:
                        console.log(secret)
                    }
                }
            })
        })


    }
}

function migrate2v1() {
}

/*      outcome/
 * Prompt the user for a password. Provide it to the callback.
 */
function withPassword(cb) {
    read({
        prompt: "Password:",
        silent: true,
    }, (err,pw) => {
        if(err) cb()
        else cb(pw)
    })
}


function showHelp() {
    console.log(`Migration Tool for Luminate`)
    console.log(`***************************`)
    console.log(`Usage:`)
    console.log(`    yarn start --to v2 <path to ./wallet account>`)
    console.log(`    yarn start --to v1 <path to ./wallet account>`)
}

main()
