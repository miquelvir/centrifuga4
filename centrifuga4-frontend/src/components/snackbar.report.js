import React from "react";
import {Button} from "@material-ui/core";

const report = (key, closeSnackbar, t, error) => {
    return( <React.Fragment>
        <Button onClick={() => {
            navigator.clipboard.writeText(
                "To mark an item, use a cross, like this: [X]\n\n" +
                "🛎️ TRIAGE\n" +
                "[ ] This issue has been reported previously and has NOT been marked as solved\n" +
                "[ ] This issue has been reported previously and has been marked as solved\n" +
                "[ ] This issue has not been reported previously\n" +
                "[ ] I have written the steps to reproduce the issue in the specified section below - ⚠️required!\n\n" +
                "🙋 TYPE OF REQUEST\n" +
                "[ ] Feature request\n" +
                "[X] Error report\n\n" +
                "📋 STEPS\n" +
                "Describe what were you doing when this error happened!\n" +
                "\n    example\n" +
                "    1. Searched 'john' in the students section, two students appeared.\n" +
                "    2. Clicked the CSV export option.\n" +
                "    3. Nothing happened, the the error message appeared.\n\n" +
                "Write your steps for repeating the issue here:\n1. ...\n\n\n" +
                "📚 STACK TRACE\n" + JSON.stringify(error) + "\n\n\n" +
                "🌩️ RESPONSE\n" + JSON.stringify(error.response) + "\n\n\n" +
                "⚙️ DEVICE CONTEXT\n" + navigator.platform + "\n" + navigator.userAgent + "\n" +
                                    navigator.appVersion + "\n" + navigator.vendor + "\n")
                .then(r => {
                    closeSnackbar(key);
                    alert("Okey, so something got messed up... 😣 Let's fix it!\n\n" +
                    "We have copied a template to the clipboard for you, so just:\n" +
                        "📤 Open your email client\n" +
                        "📋 Paste the template\n" +
                        "✏️ Fill in the details\n" +
                        "📨 Send it to the support team!\n\n")
                });
        } }>
            {t("Report")}
        </Button>
        <Button onClick={() => { closeSnackbar(key) }}>
            {t("Dismiss")}
        </Button>
    </React.Fragment>);
}

export default report;
