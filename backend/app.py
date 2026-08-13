import os
import sys
import tempfile

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS


# Allow importing analyzer.py from project root
ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

sys.path.append(ROOT_DIR)

from analyzer import analyze_resume


app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path=""
)

CORS(app)


@app.route("/")
def home():

    return send_from_directory(
        "../frontend",
        "index.html"
    )

@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        # Check resume
        if "resume" not in request.files:

            return jsonify({
                "error": "Please upload a resume PDF."
            }), 400


        resume_file = request.files["resume"]

        # Get job description
        job_description = request.form.get(
            "job_description",
            ""
        )


        if not job_description.strip():

            return jsonify({
                "error": "Please enter a job description."
            }), 400


        # Make temporary PDF file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            resume_file.save(temp_file.name)

            temp_path = temp_file.name


        try:

            # Run your existing analyzer
            result = analyze_resume(
                temp_path,
                job_description
            )

        finally:

            # Delete temporary PDF
            if os.path.exists(temp_path):

                os.remove(temp_path)


        return jsonify({

            "success": True,

            "result": result

        })


    except Exception as e:

        print("ERROR:", e)

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )