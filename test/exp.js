const chai = require("chai");
const path = require("path");
const zkSnark = require("zksnark");
const compiler = require("circom");

const assert = chai.assert;

const bigInt = require("big-integer");


const q=21888242871839275222246405745257275088548364400416034343698204186575808495617n
function addPoint(a,b) {
    const cta = 168700n;
    const d = 168696n;

    const res = [];
    res[0] = bigInt((a[0]*b[1] + b[0]*a[1]) *  bigInt(1n + d*a[0]*b[0]*a[1]*b[1]).inverse(q)).affine(q);
    res[1] = bigInt((a[1]*b[1] - cta*a[0]*b[0]) * bigInt(1n - d*a[0]*b[0]*a[1]*b[1]).inverse(q)).affine(q);
    return res;
}

function print(circuit, w, s) {
    console.log(s + ": " + w[circuit.getSignalIdx(s)]);
}

describe("Exponentioation test", () => {
    it("Should generate the Exponentiation table in k=0", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "expw4table_test.circom"));

//        console.log(JSON.stringify(cirDef, null, 1));

//        assert.equal(cirDef.nVars, 2);

        const circuit = new zkSnark.Circuit(cirDef);

        console.log("NConstrains: " + circuit.nConstraints);

        const w = circuit.calculateWitness({});

        let g = [zkSnark.bigInt("17777552123799933955779906779655732241715742912184938656739573121738514868268"),
                 zkSnark.bigInt("2626589144620713026669568689430873010625803728049924121243784502389097019475")]

        dbl= [zkSnark.bigInt("0"), zkSnark.bigInt("1")];

        for (let i=0; i<16; i++) {
            const xout1 = w[circuit.getSignalIdx(`main.out[${i}][0]`)];
            const yout1 = w[circuit.getSignalIdx(`main.out[${i}][1]`)];
/*
            console.log(xout1.toString());
            console.log(yout1.toString());
            console.log(dbl[0]);
            console.log(dbl[1]);
*/
            assert(xout1.equals(dbl[0]));
            assert(yout1.equals(dbl[1]));

            dbl = addPoint([xout1, yout1],g);
        }

    });

    it("Should generate the Exponentiation table in k=3", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "expw4table_test3.circom"));

//        console.log(JSON.stringify(cirDef, null, 1));

//        assert.equal(cirDef.nVars, 2);

        const circuit = new zkSnark.Circuit(cirDef);

        console.log("NConstrains: " + circuit.nConstraints);

        const w = circuit.calculateWitness({});

        let g = [zkSnark.bigInt("17777552123799933955779906779655732241715742912184938656739573121738514868268"),
                 zkSnark.bigInt("2626589144620713026669568689430873010625803728049924121243784502389097019475")]

        for (let i=0; i<12;i++) {
            g = addPoint(g,g);
        }

        dbl= [zkSnark.bigInt("0"), zkSnark.bigInt("1")];

        for (let i=0; i<16; i++) {
            const xout1 = w[circuit.getSignalIdx(`main.out[${i}][0]`)];
            const yout1 = w[circuit.getSignalIdx(`main.out[${i}][1]`)];

/*
            console.log(xout1.toString());
            console.log(yout1.toString());
            console.log(dbl[0]);
            console.log(dbl[1]);
*/
            assert(xout1.equals(dbl[0]));
            assert(yout1.equals(dbl[1]));

            dbl = addPoint([xout1, yout1],g);
        }

    });

    it("Should exponentiate g^31", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "exp_test.circom"));

//        console.log(JSON.stringify(cirDef, null, 1));

//        assert.equal(cirDef.nVars, 2);

        const circuit = new zkSnark.Circuit(cirDef);

        console.log("NConstrains: " + circuit.nConstraints);

        const w = circuit.calculateWitness({"in": 31});

        assert(circuit.checkWitness(w));

        let g = [zkSnark.bigInt("17777552123799933955779906779655732241715742912184938656739573121738514868268"),
                 zkSnark.bigInt("2626589144620713026669568689430873010625803728049924121243784502389097019475")]

        let c = [0n, 1n];

        for (let i=0; i<31;i++) {
            c = addPoint(c,g);
        }

        const xout = w[circuit.getSignalIdx(`main.out[0]`)];
        const yout = w[circuit.getSignalIdx(`main.out[1]`)];

/*
        console.log(xout.toString());
        console.log(yout.toString());
*/
        assert(xout.equals(c[0]));
        assert(yout.equals(c[1]));

        console.log("-------")
        const w2 = circuit.calculateWitness({"in": (1n<<252n)+1n});

        const xout2 = w2[circuit.getSignalIdx(`main.out[0]`)];
        const yout2 = w2[circuit.getSignalIdx(`main.out[1]`)];

        c = [g[0], g[1]];
        for (let i=0; i<252;i++) {
            c = addPoint(c,c);
        }
        c = addPoint(c,g);
/*
        console.log(xout2.toString());
        console.log(yout2.toString());
        console.log(c[0].toString());
        console.log(c[1].toString());
*/
        assert(xout2.equals(c[0]));
        assert(yout2.equals(c[1]));

    }).timeout(10000000);

    it("Number of constrains for 256 bits", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "exp_test_min.circom"));

        const circuit = new zkSnark.Circuit(cirDef);

        console.log("NConstrains: " + circuit.nConstraints);
    }).timeout(10000000);

});
