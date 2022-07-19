module.exports.loadDB = async (directory) => {
    const fs = require("fs");

    var contents = {};
    await fs.readdir(directory, (error, files) => {
        if(error) {
            console.log(error);
        }
        else {
            const regex = new RegExp("^c\\.(\\d+)([AGTCU]+)>([ATGCU])+,\\s*p(.)");

            files = files.map(file => file.split(".")[0]);
            files.forEach(async (file) => {
                await fs.readFile(directory + file + ".txt", "utf-8", (error, data) => {
                    if(error) {
                        console.log(error)
                    }
                    else {
                        var lines = data.split("\n");
                        lines = lines.filter(line => regex.test(line));
                    
                        var count = 0;
                        lines = lines.map(line => {
                            var items = line.split(",");
                            var comment = "";
                            
                            try {comment = items[2].trim();}
                            catch {}

                            count++;

                            return {
                                position: items[0].trim(),
                                protein: items[1].trim(),
                                comment: comment,
                                id: count - 1
                            };
                        });

                        contents[file] = lines;
                    }
                })
            });
        }
    });

    return contents;
};

module.exports.saveToDB = async (directory, gene, contents) => {
    const fs = require("fs");

    var output = "#" + gene + "\n\n";
    contents.forEach(mutation => {
        output += (mutation.position + ",");
        output += (mutation.protein + ",");
        output += (mutation.comment + "\n"); 
    });

    await fs.writeFile(directory + "/" + gene + ".txt", output, (error) => {
        if(error) {
            console.log(error);
        }
    });
};

module.exports.commitDB = async (directory, user) => {
    const { exec } = require("child_process");

    await exec("git add " + directory + "*.txt", (error, stdout, stderr) => {
        if (error) {
            console.log("Error: " + error);
        }

        if(stderr) {
            console.log("Stderr: " + stderr);
        }

        console.log(stdout);
    });

    await exec("git commit -m '" + user + " made changes to DB'", (error, stdout, stderr) => {
        if(error) {
            console.log("Error: " + error);
        }

        if(stderr) {
            console.log("Stderr: " + stderr);
        }

        console.log(stdout);
    });
};