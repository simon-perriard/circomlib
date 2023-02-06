/*
    Copyright 2018 0KIMS association.

    This file is part of circom (Zero Knowledge Circuit Compiler).

    circom is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    circom is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with circom. If not, see <https://www.gnu.org/licenses/>.
*/
pragma circom 2.0.0;

include "comparators.circom";

template ArrayMustContain(n) {
    signal input in[n];
    signal input e;

    signal res[n];
    res[0] <== in[0] - e;

    for (var i = 1; i < n; i++) {
        // No overflow can lead to x*y==P==0 otherwise P is not prime
        res[i] <== res[i-1] * (in[i] - e);
    }
    res[n-1] === 0;
}