const resumeInput = document.getElementById("resumeInput");

const uploadArea = document.getElementById("uploadArea");

const fileName = document.getElementById("fileName");

const jobDescription =
    document.getElementById("jobDescription");

const charCount =
    document.getElementById("charCount");

const analyzeButton =
    document.getElementById("analyzeButton");

const loading =
    document.getElementById("loading");

const results =
    document.getElementById("results");

const resetButton =
    document.getElementById("resetButton");



/* =========================================
   FILE UPLOAD
========================================= */

resumeInput.addEventListener(
    "change",
    function () {

        if (this.files.length === 0) {
            return;
        }

        const file = this.files[0];

        fileName.textContent =
            "✓ " + file.name;

    }
);



/* =========================================
   CHARACTER COUNT
========================================= */

jobDescription.addEventListener(
    "input",
    function () {

        charCount.textContent =
            `${this.value.length} characters`;

    }
);



/* =========================================
   DRAG & DROP
========================================= */

uploadArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        uploadArea.style.borderColor =
            "#8B5CF6";

    }
);


uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.style.borderColor =
            "";

    }
);


uploadArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        uploadArea.style.borderColor =
            "";

        const files =
            event.dataTransfer.files;

        if (files.length > 0) {

            resumeInput.files = files;

            fileName.textContent =
                "✓ " + files[0].name;

        }

    }
);



/* =========================================
   ANALYZE
========================================= */

analyzeButton.addEventListener(
    "click",
    analyzeResume
);


async function analyzeResume() {

    const resume =
        resumeInput.files[0];

    const jd =
        jobDescription.value.trim();


    /* Validation */

    if (!resume) {

        alert(
            "Please upload your resume PDF."
        );

        return;

    }


    if (!jd) {

        alert(
            "Please paste the job description."
        );

        return;

    }


    /* Loading */

    loading.classList.remove("hidden");

    results.classList.add("hidden");

    analyzeButton.disabled = true;


    /* Form data */

    const formData =
        new FormData();

    formData.append(
        "resume",
        resume
    );

    formData.append(
        "job_description",
        jd
    );


    try {

        const response =
            await fetch(
                "/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Analysis failed."
            );

        }


        displayResults(
            data.result
        );


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong:\n\n" +
            error.message
        );


    } finally {

        loading.classList.add("hidden");

        analyzeButton.disabled = false;

    }

}



/* =========================================
   DISPLAY RESULTS
========================================= */

function displayResults(rawResult) {

    document.getElementById(
        "rawResult"
    ).textContent = rawResult;


    /* =========================================
       SCORE
    ========================================= */

    const scoreMatch =
        rawResult.match(
            /ATS\s*SCORE\s*[:\-]?\s*(\d+)\s*(?:\/\s*100|out\s+of\s+100)?/i
        );


    let score = 0;


    if (scoreMatch) {

        score =
            parseInt(
                scoreMatch[1]
            );

    }


    /*
       Fallback:
       Some Gemini responses may write:
       "Score: 62/100"
       instead of:
       "ATS SCORE: 62/100"
    */

    if (!scoreMatch) {

        const fallbackScore =
            rawResult.match(
                /(?:SCORE|MATCH)\s*[:\-]?\s*(\d+)\s*(?:\/\s*100|%)/i
            );

        if (fallbackScore) {

            score =
                parseInt(
                    fallbackScore[1]
                );

        }

    }


    document.getElementById(
        "score"
    ).textContent = score;


    /* =========================================
       SCORE LABEL
    ========================================= */

    let label =
        "Needs improvement";


    if (score >= 80) {

        label =
            "Strong match";

    } else if (score >= 65) {

        label =
            "Good foundation";

    } else if (score >= 50) {

        label =
            "Considered";

    }


    document.getElementById(
        "scoreLabel"
    ).textContent =
        label;


    document.getElementById(
        "scoreSummary"
    ).textContent =
        `Your resume has a ${score}% match with the provided job description. Review the missing skills and suggestions below to strengthen your application.`;



    /* =========================================
       MATCHING SKILLS
    ========================================= */

    const matching =
        extractSection(
            rawResult,
            "MATCHING SKILLS",
            "MISSING SKILLS"
        );


    renderSkills(
        "matchingSkills",
        matching
    );



    /* =========================================
       MISSING SKILLS
    ========================================= */

    const missing =
        extractSection(
            rawResult,
            "MISSING SKILLS",
            "SUGGESTIONS"
        );


    renderSkills(
        "missingSkills",
        missing
    );



    /* =========================================
       SUGGESTIONS
    ========================================= */

    const suggestions =
        extractSection(
            rawResult,
            "SUGGESTIONS",
            null
        );


    renderSuggestions(
        suggestions
    );



    /* =========================================
       SHOW RESULTS
    ========================================= */

    results.classList.remove(
        "hidden"
    );


    results.scrollIntoView({
        behavior: "smooth"
    });

}



/* =========================================
   EXTRACT SECTIONS
========================================= */

function extractSection(
    text,
    start,
    end
) {

    const upperText =
        text.toUpperCase();


    const startIndex =
        upperText.indexOf(
            start.toUpperCase()
        );


    if (startIndex === -1) {

        return [];

    }


    let section =
        text.substring(
            startIndex + start.length
        );


    /* Stop at next section */

    if (end) {

        const endIndex =
            section
                .toUpperCase()
                .indexOf(
                    end.toUpperCase()
                );


        if (endIndex !== -1) {

            section =
                section.substring(
                    0,
                    endIndex
                );

        }

    }


    return section

        .split("\n")

        .map(line => {

            return line

                /* Markdown headings */
                .replace(
                    /^#+\s*/,
                    ""
                )

                /* Numbered lists */
                .replace(
                    /^\d+[\.\)]\s*/,
                    ""
                )

                /* Bullet points */
                .replace(
                    /^[-•*]\s*/,
                    ""
                )

                /* Check marks */
                .replace(
                    /^\s*[✓✔]\s*/,
                    ""
                )

                /* Extra whitespace */
                .trim();

        })

        .filter(line => {

            if (!line) {
                return false;
            }


            const upperLine =
                line.toUpperCase();


            /* Ignore repeated headings */

            if (
                upperLine ===
                "MATCHING SKILLS"
            ) {
                return false;
            }


            if (
                upperLine ===
                "MISSING SKILLS"
            ) {
                return false;
            }


            if (
                upperLine ===
                "SUGGESTIONS"
            ) {
                return false;
            }


            return true;

        });

}



/* =========================================
   RENDER SKILLS
========================================= */

function renderSkills(
    elementId,
    skills
) {

    const container =
        document.getElementById(
            elementId
        );


    container.innerHTML = "";


    if (skills.length === 0) {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            "None identified";

        container.appendChild(
            li
        );

        return;

    }


    skills.forEach(
        skill => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                skill;


            container.appendChild(
                li
            );

        }
    );

}



/* =========================================
   RENDER SUGGESTIONS
========================================= */

function renderSuggestions(
    suggestions
) {

    const container =
        document.getElementById(
            "suggestions"
        );


    container.innerHTML = "";


    if (suggestions.length === 0) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "suggestion";


        card.innerHTML = `
            <h4>
                No suggestions available
            </h4>
        `;


        container.appendChild(
            card
        );


        return;

    }


    suggestions.forEach(
        (suggestion, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "suggestion";


            card.innerHTML = `

                <span class="suggestion-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <h4>
                    ${suggestion}
                </h4>

            `;


            container.appendChild(
                card
            );

        }
    );

}



/* =========================================
   RESET
========================================= */

resetButton.addEventListener(
    "click",
    function () {

        results.classList.add(
            "hidden"
        );


        resumeInput.value = "";


        fileName.textContent = "";


        jobDescription.value = "";


        charCount.textContent =
            "0 characters";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);