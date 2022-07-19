const positionInput = $("#positionInput");
const positionError = $("#positionError");
const positionMessage = "Need c. before DNA/RNA";

const proteinInput = $("#proteinInput");
const proteinError = $("#proteinError");
const proteinMessage = "Need p. before protein";

const commentInput = $("#commentInput");
const commentError = $("#commentError");
const commentMessage = "Need COSM to specify cosmic ID";

function test(input, regex, error, message) {
    if(regex.test(input.val())) {
        error.text("");
        error.attr("hidden", true);
    } else {
        error.text(message);
        error.attr("hidden", false);
    }
};

function testPosition() {
    const regex = new RegExp("^c[.]");
    test(positionInput, regex, positionError, positionMessage);
};

function testProtein() {
    const regex = new RegExp("^p[.]");
    test(proteinInput, regex, proteinError, proteinMessage);
};

function testComment() {
    const regex = new RegExp("(COSM)");
    test(commentInput, regex, commentError, commentMessage);
};

positionInput.keyup(testPosition);
proteinInput.keyup(testProtein);
commentInput.keyup(testComment);

testPosition();
testProtein();
testComment();
