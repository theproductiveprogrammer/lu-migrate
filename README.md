# Lu-Migrate: Migrate old Luminate Wallets

**Lu-Migrate** is a utility for users of the old
[Luminate](https://github.com/theproductiveprogrammer/luminate)
embeddable command-line stellar client.


![lu-migrate.png](lu-migrate.png)


Old wallets can be migrated to the new version of
[Luminate](https://github.com/theproductiveprogrammer/luminate) using
this utility.


## The Problem

[Luminate](https://github.com/theproductiveprogrammer/luminate) used to
use [scrypt](https://www.npmjs.com/package/scrypt) to for the [Password
Key Derivation Function](https://en.wikipedia.org/wiki/PBKDF2). `scrypt`
(or [bcrypt](https://www.npmjs.com/package/bcrypt)) are the recommended
ways of doing `PBKDF`.

However both `scrypt` and `bcrypt` are hard to install on Windows. While
possible, they both are not a simple install and can take quite a bit of
work to get done. For this reason
[Luminate](https://github.com/theproductiveprogrammer/luminate) moved to
using the [core crypto](https://nodejs.org/api/crypto.html) libraries
bundled with [Node](http://nodejs.org).

The new [Luminate](https://github.com/theproductiveprogrammer/luminate)
works fine but older users now need to migrate their wallets from the
old `scrypt` version to the new `core crypto` version.


## Using Lu-migrate

1. Find your existing `Luminate` wallet. This is generally in the hidden
   `.wallet/` subdirectory. If you changed the wallet path, please use
   the path you specified.
2. Inside the `.wallet/` subdirectory there are account files - one for
   each stellar account managed by `Luminate`.
3. For each account file, migrate it using the following command:

        $> yarn start --to v2 <path to wallet account file>


## Feedback & Issues

Please report your feedback and issues in the
[issue tracker](https://github.com/theproductiveprogrammer/lu-migrate/issues).
