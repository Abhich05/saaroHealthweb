"""
Simple smoke test for the Voice-Prescription Python project.
It uses the bundled `test-voice.wav` and runs the extract pipeline without GUI.
"""
from extract_text import extract

if __name__ == "__main__":
    sample = "Patient name is Ram age 19 tablet azithromycin 500mg 3days after food morning only syrup robitussin 5ml 5days before food thrice a day."
    print("Running extract() on sample text:\n", sample)
    try:
        name, age, date, tablet = extract(sample)
        print(f"Name: {name}\nAge: {age}\nDate: {date}\nTablet: {tablet}")
    except Exception as e:
        print("Smoke test failed:", e)
