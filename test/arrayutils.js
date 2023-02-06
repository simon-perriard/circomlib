const chai = require("chai");
const path = require("path");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const wasm_tester = require("circom_tester").wasm;

const assert = chai.assert;

describe("Array utils test", function ()  {

    this.timeout(100000);

    let cir;
    before( async() => {

        cir = await wasm_tester(path.join(__dirname, "circuits", "array_must_contain_test.circom"));
    });

    it("Should enforce that an element is part of the array", async() => {

        let witness;
        for (let i = 0; i < 10; i++) {
            witness = await cir.calculateWitness({"in": [0,1,2,3,4,5,6,7,8,9], "e": i}, true);
            assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        }
    })

    it("Should fail to prove if element is not part of the array", async() => {
        try {
            await cir.calculateWitness({"in": [0,1,2,3,4,5,6,7,8,9], "e": 42}, true);
            assert(false);
        } catch(err) {
            assert(err.message.includes("Assert Failed"));
        }
    })
});
