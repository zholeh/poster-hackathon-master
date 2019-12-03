const express = require("express");
const axios = require("axios");
const morgan = require("morgan");
const tryToCatch = require('try-to-catch');
const { errorHandler } = require("./errorHandler");
const port = 3000;
const { find } = require("./queryBZU");
const { json } = express;

const app = express();
const token = "368940:9788484e09cd9cc48caf98aaa1d55d70";
const clientPath = "client/dist/app";

app
    .use(morgan("dev"))
    .use(json())
    .post('/newingredient', acceptIngridientWebhook)
    .get("/bzhu/:code?", getProducts)
    .get('/ingredients', getIngredients)
    .get('/mapping/single', getSingleMapping)
    .post('/ingredients/extras', addExtrasToIngredients)
    .get("*.*", express.static(clientPath))
    .all("*", function (req, res) {
        res.status(200).sendFile(`/`, { root: clientPath });
    })
    .use(errorHandler)
    .listen(port, () => console.log(`App listening on port ${port}!`));


async function getSingleMapping(req, res) {
    const { query } = req;
    const { str } = query;

    return res.send(find(str));
}

async function acceptIngridientWebhook(req, res) {
    const { body } = req;
    const { action, object_id } = body;

    if (!action || !object_id)
        return;

    res.status(200).send();

    if (action !== 'added')
        return;

    const { data: { response: {ingredient_name} } } = await axios.get('https://las-vegan-niko.joinposter.com/api/menu.getIngredient', {
        params: {
            token,
            ingredient_id: object_id,
        },
    });

    console.log(ingredient_name);
   
    const [match = {}] = find(ingredient_name);

    const { proteins = 0, carbohydrates: carbs = 0, fats = 0, label = '', kcal = 0 } = match;        

    const config = {
        method: 'post',
        url: 'https://las-vegan-niko.joinposter.com/api/application.setEntityExtras',
        params: {
            token,
        },
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            entity_type: "ingredient",
            entity_id: object_id,
            extras: {
                carbs,
                fats,
                proteins,
                kcal,
                label,
            },
        },
    };

   const [err, r] = await tryToCatch(axios, config);
   console.log(err);
}

async function addExtrasToIngredients(req, res, next) {
    const { body } = req;
    const { ingredients } = body;

    const requests = ingredients.map(async ({ ingredient_id, carbs, fats, proteins, kcal, label }) => {
        const config = {
            method: 'post',
            url: 'https://las-vegan-niko.joinposter.com/api/application.setEntityExtras',
            params: {
                token,
            },
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                entity_type: "ingredient",
                entity_id: ingredient_id,
                extras: {
                    carbs,
                    fats,
                    proteins,
                    kcal,
                    label,
                },
            },
        };

        const resp = tryToCatch(axios, config);

        return resp;
    });

    const values = await Promise.all(requests);

    return res.send('123');
}

async function getIngredients(req, res) {
    const { data: { response } } = await axios.get('https://las-vegan-niko.joinposter.com/api/menu.getIngredients', {
        params: {
            token,
        },
    });
    const { query: { unmappedOnly = false } } = req;

    const totalAmont = response.length;

    let unmappedIngredients = [];
    const mappedIngredients = [];

    response.forEach(ingredient => {
        const { extras } = ingredient;

        if (!extras) {
            return unmappedIngredients.push(ingredient);
        }
        const { proteins, fats, carbs } = extras;
        if (!proteins || !fats || !carbs)
            return unmappedIngredients.push(ingredient);;
        return mappedIngredients.push({ ingredient });
    });

    const unmappedAmount = unmappedIngredients.length;

    unmappedIngredients = unmappedIngredients.map((ingr) => {
        const { ingredient_name } = ingr;
        const [match = {}] = find(ingredient_name);

        const { proteins = 0, carbohydrates: carbs = 0, fats = 0, label = '', kcal = 0 } = match;

        const ingredient = {
            ...ingr,
            extras: {
                carbs,
                fats,
                label,
                kcal,
                proteins,
            },
        };

        return { ingredient };
    });

    let mappings = [...unmappedIngredients];

    if (!unmappedOnly) {
        mappings.push(...mappedIngredients);
    }

    return res.send({
        totalAmont,
        unmappedAmount,
        mappings,
    })
}

async function getProducts(req, res) {
    const { data } = await axios.get('https://las-vegan-niko.joinposter.com/api/menu.getProducts', {
        params: {
            token,
            type: 'batchtickets',
        }
    });
    const { response } = data;

    const pr = response.map(async product => {
        const { ingredients, product_name, photo } = product;
        const sum = ingredients.map(async ingredient => {
            return getBzhu(ingredient);
        });

        const items = await Promise.all(sum);

        const bzhu = {
            proteins: 0,
            fats: 0,
            carbs: 0,
            kcal: 0,
        }

        items.forEach((ingr) => {
            bzhu.proteins += ingr.proteins;
            bzhu.carbs += ingr.carbs;
            bzhu.fats += ingr.fats;
            bzhu.kcal += ingr.kcal;
        });


        return { product_name, ...bzhu, items, image: photo };
    });

    const values = await Promise.all(pr);

    return res.send(values);
};

async function getBzhu(ingredient) {
    const { structure_type, structure_netto, ingredient_id, ingredient_name } = ingredient;

    if (structure_type === '2') {
        const { data: { response: { ingredients } } } = await axios.get('https://las-vegan-niko.joinposter.com/api/menu.getPrepack', {
            params: {
                token,
                product_id: ingredient_id,
            },
        });

        const arr = ingredients.map(async ingr => {
            return getBzhu(ingr);
        });

        const items = await Promise.all(arr);

        const bzhu = {
            proteins: 0,
            fats: 0,
            carbs: 0,
            kcal: 0,
            ingredient_name,
            items,
        }

        items.forEach((ingr) => {
            bzhu.proteins += ingr.proteins;
            bzhu.carbs += ingr.carbs;
            bzhu.fats += ingr.fats;
            bzhu.kcal += ingr.kcal;
        });

        return bzhu;
    } else if (structure_type === '1') {
        const { data: { response } } = await axios.get('https://las-vegan-niko.joinposter.com/api/menu.getIngredient', {
            params: {
                token,
                ingredient_id,
            },
        });

        const { extras, ingredient_name } = response;

        if (!extras) {

            return {
                proteins: 0,
                fats: 0,
                carbs: 0,
                kcal: 0,
                ingredient_name,
            }
        }
        const { proteins, fats, carbs, kcal } = extras;
        const mpy = +structure_netto / 100;
        const bzhu = {
            proteins: +proteins * mpy,
            fats: +fats * mpy,
            carbs: +carbs * mpy,
            kcal: +kcal * mpy,
            ingredient_name,
        };

        return bzhu;
    }
}

