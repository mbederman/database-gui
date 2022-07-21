//uses jquery to get the difference html tags for each input type
const positionInput = $("#positionInput");
const positionError = $("#positionError");
const positionMessage = "Need c. before DNA/RNA";

const proteinInput = $("#proteinInput");
const proteinError = $("#proteinError");
const proteinMessage = "Need p. before protein";

const commentInput = $("#commentInput");
const commentError = $("#commentError");
const commentMessage = "Need COSM to specify cosmic ID";

// checks if the user's input has certain criteria depending on the regex passed in 
function test(input, regex, error, message) {
    if(regex.test(input.val())) {
        error.text("");
        error.attr("hidden", true);
    } else {
        error.text(message);
        error.attr("hidden", false);
    }
};

// checks if position input has "c."
function testPosition() {
    const regex = new RegExp("^c[.]");
    test(positionInput, regex, positionError, positionMessage);
};

// checks if protien input has "p."
function testProtein() {
    const regex = new RegExp("^p[.]");
    test(proteinInput, regex, proteinError, proteinMessage);
};

// checks if comment has "COSM" for comsic ID
function testComment() {
    const regex = new RegExp("(COSM)");
    test(commentInput, regex, commentError, commentMessage);
};

// adds corresponding functions to the keyup event listener
positionInput.keyup(testPosition);
proteinInput.keyup(testProtein);
commentInput.keyup(testComment);

// calls the functions initially to check current entries to each field 
testPosition();
testProtein();
testComment();
