from jinja2 import Environment, DebugUndefined, DictLoader
from jinja2.meta import find_undeclared_variables
import os

import json


def is_default_kw(kw):
    if len(kw) < 5:
        return False
    if kw[:2] != '__':
        return False
    if kw[-2:] != '__':
        return False
    return True


def is_standard_kw(kw):
    if len(kw) < 3:
        return True
    if kw[:1] != '_':
        return True
    return False


def is_translation_kw(kw):
    if is_default_kw(kw):
        return False
    if is_standard_kw(kw):
        return False
    return True


def get_keywords(text):
    if text is None:
        return set()

    env = Environment(loader=DictLoader({'footer.html': '<<<footer goes here>>>'}), undefined=DebugUndefined)
    tmp = env.from_string(text)
    rendered = tmp.render()

    print(rendered)

    ast = env.parse(rendered)
    undefined = find_undeclared_variables(ast)

    return set(x for x in undefined if is_translation_kw(x))


def ask_file(file_name):
    path = input(f"path to {file_name}: ")
    path = 'C:\\Users\\vazqu\\PycharmProjects\\centrifuga4\\server\\emails\\templates\\invite_email\\body.html'
    return path if path != '' else None


def read_file(file_path):
    if file_path is None:
        return None

    with open(file_path, encoding='utf8') as f:
        return f.read()


def main():
    email_folder_path = input("path to email: ")
    email_folder_path = "C:\\Users\\vazqu\\PycharmProjects\\centrifuga4\\server\\emails\\templates\\invite_email"
    if not os.path.exists(email_folder_path):
        os.makedirs(email_folder_path)

    translations_path = os.path.join(email_folder_path, 'translations')
    if not os.path.exists(translations_path):
        os.makedirs(translations_path)

    parsed = []

    body_path = os.path.join(email_folder_path, 'body.html')
    if os.path.exists(body_path):
        body = read_file(body_path)
        parsed.append(body)

    plain_path = os.path.join(email_folder_path, 'plain.txt')
    if os.path.exists(plain_path):
        plain = read_file(plain_path)
        parsed.append(plain)

    languages = input('languages (comma-separated) [ca,en,es]: ')
    languages = languages if languages != '' else 'ca,en,es'
    languages = set(languages.split(','))
    print('lans >', languages)

    all_keywords = set()
    for file in parsed:
        all_keywords.update(get_keywords(file))
    print('keywords >', all_keywords)

    keywords_dict = {
        kw: "" for kw in all_keywords
    }

    for language in languages:
        with open(os.path.join(translations_path, f"{language}.json"), 'w') as f:
            json.dump(keywords_dict, f, indent=4)


if __name__ == "__main__":
    main()
