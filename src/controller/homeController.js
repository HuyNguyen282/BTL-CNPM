let getHomePage = (req, res) => {
    return res.render("index.ejs");
};

let aboutPage = (req, res) => {
    return res.render("about.ejs");
};

module.exports = {
    getHomePage,
    aboutPage
};
