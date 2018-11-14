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
 * Load the given account file and migrate it from version 1 to version 2
 */
function migrate2v2(acc) {
    migrateFromTo(crypt.password2keyv1, crypt.password2keyv2,
        'v1', 'v2',
        (ver) => { return !ver || ver == 'v1' },
        acc)
}

/*      outcome/
 * Load the given account file and migrate it from version 2 to version 1
 */
function migrate2v1(acc) {
    migrateFromTo(crypt.password2keyv2, crypt.password2keyv1,
        'v2', 'v1',
        (ver) => { return ver == 'v2' },
        acc)
}

function migrateFromTo(fromkeyfn, tokeyfn, versionFrom, versionTo, versionCheck, acc) {
    fs.readFile(acc, 'utf8', (err, data) => {
        if(err) {
            console.error(`Cannot load as account: ${acc}`)
            console.error(err)
        } else {
            try {
                data = JSON.parse(data)
                migrate2_1(data)
            } catch(e) {
                console.error(e)
                console.error(`Unable to understand as a wallet account: ${acc}`)
            }
        }
    })

    /*      outcome/
     * Check that the data is a valid file for the given version, get
     * the password and decrypt the secret key, then ask for a new
     * password and re-encrypt it as the new format.
     */
    function migrate2_1(data) {
        if(!versionCheck(data.version)){
            console.error(`Not a ${versionFrom} file: ${acc}`)
            return
        }
        if(!data.label ||
            !data.pub ||
            data.pkg != 'tweetnacl' ||
            !data.nonce ||
            !data.salt ||
            !data.secret) {
            console.error(`Missing account data: ${acc}`)
            return
        }

        withPassword('Password', (pw) => {
            if(!pw) {
                console.error(`Please provide the account password`)
                return
            }
            fromkeyfn(data.salt, pw, (err, key) => {
                if(err) console.error(err)
                else {
                    let secret = crypt.decrypt(data.secret, data.nonce, key)
                    if(!secret) console.error(`Incorrect password`)
                    else {
                        withPassword('New Password (leave empty to use same password)', (pw2) => {
                            if(!pw2) pw2 = pw
                            tokeyfn(data.salt, pw, (err, key2) => {
                                if(err) console.error(err)
                                else {
                                    data.version = versionTo
                                    data.secret = crypt.encrypt(secret, data.nonce, key2)
                                    fs.writeFile(acc, JSON.stringify(data,null,2), 'utf-8', (err) => {
                                        if(err) console.error(err)
                                        else console.log(`Migrated`)
                                    })
                                }
                            })
                        })
                    }
                }
            })
        })


    }
}

/*      outcome/
 * Prompt the user for a password. Provide it to the callback.
 */
function withPassword(prompt, cb) {
    read({
        prompt: `${prompt}:`,
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
