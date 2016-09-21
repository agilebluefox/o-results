function createCodename(n, d) {
    let codename = '';
    const name = n.toLowerCase().split(' ');

    name.forEach((word) => {
        codename += word.substr(0, 1);
    });

    // Create a date object from the UTC formatted string
    const date = new Date(d);

    // Extract the year, month, and day
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // generate random number to add to end
    const min = 1000;
    const max = 10000;
    const random = getRandomInt(min, max);

    // Use the intials, date components, and random number
    // to create a "unique" codename in case I need it later
    codename += `${year}${month}${day}-${random}`;

    return codename;
}

function getRandomInt(min, max) {
    Math.ceil(min);
    Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = createCodename;
