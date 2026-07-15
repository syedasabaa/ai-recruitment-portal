import pytest
import fitz
import docx

from app.services.text_extraction import extract_text, extract_text_from_pdf, extract_text_from_docx


def make_test_pdf(path, text):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    doc.save(str(path))
    doc.close()


def make_test_docx(path, text):
    document = docx.Document()
    document.add_paragraph(text)
    document.save(str(path))


def test_extract_text_from_pdf(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    make_test_pdf(pdf_path, "Ahmed Khalid - Python Developer")

    text = extract_text_from_pdf(str(pdf_path))
    assert "Ahmed Khalid" in text
    assert "Python Developer" in text


def test_extract_text_from_docx(tmp_path):
    docx_path = tmp_path / "sample.docx"
    make_test_docx(docx_path, "Fatima Noor - React Developer")

    text = extract_text_from_docx(str(docx_path))
    assert "Fatima Noor" in text
    assert "React Developer" in text


def test_extract_text_dispatches_pdf(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    make_test_pdf(pdf_path, "Dispatch Test PDF")

    text = extract_text(str(pdf_path))
    assert "Dispatch Test PDF" in text


def test_extract_text_dispatches_docx(tmp_path):
    docx_path = tmp_path / "sample.docx"
    make_test_docx(docx_path, "Dispatch Test DOCX")

    text = extract_text(str(docx_path))
    assert "Dispatch Test DOCX" in text


def test_extract_text_rejects_unsupported_extension(tmp_path):
    fake_file = tmp_path / "resume.txt"
    fake_file.write_text("just plain text")

    with pytest.raises(ValueError):
        extract_text(str(fake_file))