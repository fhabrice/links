#!/usr/bin/env python3
"""Génère les questionnaires d'examen d'informatique pour la 1ère et la 2ème primaire
   de l'école 'Complexe Scolaire Un Jour Nouveau'.
   Thème : ouverture de Paint et dessin/coloriage des formes (rectangle, cœur,
   triangle, étoile) dans Paint. Version noir et blanc, sans grille de pondération ;
   l'élève remplit son nom, son numéro, sa classe et le lieu."""

from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

SCHOOL = "COMPLEXE SCOLAIRE UN JOUR NOUVEAU"
MATIERE = "INFORMATIQUE"
NOIR = RGBColor(0x00, 0x00, 0x00)
GRIS_FOND = RGBColor(0xE0, 0xE0, 0xE0)


def set_cell_bg(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def titre_centre(doc, texte, taille, gras=True, espace_apres=4, espace_avant=0):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(espace_avant)
    p.paragraph_format.space_after = Pt(espace_apres)
    r = p.add_run(texte)
    r.font.size = Pt(taille)
    r.font.bold = gras
    r.font.color.rgb = NOIR
    return p


def en_tete(doc, classe, titre_examen):
    titre_centre(doc, SCHOOL, 16, espace_apres=0)
    titre_centre(doc, f"Examen de {MATIERE} — {classe}", 13, espace_apres=2)
    titre_centre(doc, titre_examen, 12, gras=False, espace_apres=8)

    # Bloc identité élève (à remplir par l'enfant)
    tbl = doc.add_table(rows=2, cols=4)
    tbl.style = 'Table Grid'
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    ident = [
        ("Nom et prénom de l'élève", "", "Numéro", ""),
        ("Classe", "", "Lieu de l'examen", ""),
    ]
    for i, (lib1, val1, lib2, val2) in enumerate(ident):
        c0 = tbl.rows[i].cells[0]
        c0.text = lib1
        c0.paragraphs[0].runs[0].font.bold = True
        c0.paragraphs[0].runs[0].font.size = Pt(9)
        set_cell_bg(c0, 'E0E0E0')
        tbl.rows[i].cells[1].text = val1
        tbl.rows[i].cells[1].paragraphs[0].runs[0].font.size = Pt(9)

        c2 = tbl.rows[i].cells[2]
        c2.text = lib2
        c2.paragraphs[0].runs[0].font.bold = True
        c2.paragraphs[0].runs[0].font.size = Pt(9)
        set_cell_bg(c2, 'E0E0E0')
        tbl.rows[i].cells[3].text = val2
        tbl.rows[i].cells[3].paragraphs[0].runs[0].font.size = Pt(9)

    doc.add_paragraph()


def consigne(doc, texte):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("CONSIGNES GÉNÉRALES")
    r.font.bold = True
    r.font.size = Pt(11)
    r.font.color.rgb = NOIR
    p2 = doc.add_paragraph(texte)
    p2.paragraph_format.space_after = Pt(4)
    for run in p2.runs:
        run.font.size = Pt(10)


def tache(doc, numero, titre, etapes, points):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(f"TÂCHE {numero} : {titre}")
    r.font.bold = True
    r.font.size = Pt(11)
    r.font.color.rgb = NOIR

    pt = doc.add_paragraph()
    rr = pt.add_run(f"(Sur {points} points)")
    rr.font.italic = True
    rr.font.size = Pt(9)
    rr.font.color.rgb = NOIR
    pt.paragraph_format.space_after = Pt(2)

    for i, etape in enumerate(etapes, 1):
        e = doc.add_paragraph(style='List Number')
        e.paragraph_format.space_after = Pt(1)
        run = e.add_run(etape)
        run.font.size = Pt(10)


def ajouter_pied(doc):
    section = doc.sections[0]
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(f"{SCHOOL} — Examen {MATIERE} — Année scolaire 2025-2026")
    r.font.size = Pt(8)
    r.font.color.rgb = NOIR


# ============================================================
#  DOCUMENT 1 : 1ère PRIMAIRE
# ============================================================
def doc_1ere():
    doc = Document()
    for s in doc.sections:
        s.top_margin = Cm(1.8); s.bottom_margin = Cm(1.8)
        s.left_margin = Cm(2); s.right_margin = Cm(2)

    en_tete(doc, "1ère PRIMAIRE", "Ouverture de Paint et dessins")

    consigne(doc,
             "Cet examen se passe sur l'ordinateur. Lis chaque tâche calmement et "
             "réalise-la à l'écran. L'enseignant t'observe et note ce que tu réussis. "
             "N'oublie pas de bien écrire ton nom.")

    tache(doc, 1, "Allumer l'ordinateur", [
        "Appuie sur le bouton d'allumage de l'ordinateur.",
        "Attends que l'écran s'allume et que le Bureau (Windows) apparaisse.",
        "Vérifie que le système est prêt à être utilisé.",
    ], 4)

    tache(doc, 2, "Ouvrir l'application Paint", [
        "Clique sur le bouton 'Démarrer' (en bas à gauche).",
        "Cherche le programme 'Paint' et clique dessus pour l'ouvrir.",
        "Vérifie que la fenêtre de Paint s'affiche à l'écran.",
    ], 5)

    tache(doc, 3, "Dessiner et colorier un rectangle", [
        "Choisis l'outil 'Rectangle' dans la barre d'outils.",
        "Dessine un grand rectangle au milieu de la page.",
        "Choisis une couleur dans la palette et remplis le rectangle.",
    ], 6)

    tache(doc, 4, "Dessiner et colorier un cœur (forme 'love')", [
        "Cherche l'outil qui dessine un cœur (ou utilise les formes).",
        "Dessine un cœur sous le rectangle.",
        "Colorie le cœur avec la couleur de ton choix (rouge, rose…).",
    ], 5)

    ajouter_pied(doc)
    doc.save("Examen_Informatique_1ere_Primaire.docx")


# ============================================================
#  DOCUMENT 2 : 2ème PRIMAIRE
# ============================================================
def doc_2eme():
    doc = Document()
    for s in doc.sections:
        s.top_margin = Cm(1.8); s.bottom_margin = Cm(1.8)
        s.left_margin = Cm(2); s.right_margin = Cm(2)

    en_tete(doc, "2ème PRIMAIRE", "Dossier Windows, Paint et formes géométriques")

    consigne(doc,
             "Cet examen se passe sur l'ordinateur. Réalise chaque tâche dans l'ordre, "
             "en suivant les étapes. L'enseignant note tes réussites. Sois soigné dans "
             "tes dessins et tes couleurs.")

    tache(doc, 1, "Créer un dossier dans Windows", [
        "Allume l'ordinateur et attends le Bureau (Windows).",
        "Ouvre 'Ce PC' (ou 'Poste de travail') depuis le Bureau.",
        "Va dans le dossier 'Documents'.",
        "Clique droit → 'Nouveau' → 'Dossier'.",
        "Nomme le dossier avec ton nom et prénom, puis valide.",
    ], 4)

    tache(doc, 2, "Ouvrir l'application Paint", [
        "Clique sur 'Démarrer' puis recherche 'Paint'.",
        "Ouvre Paint et attends que la page blanche apparaisse.",
    ], 3)

    tache(doc, 3, "Dessiner et colorier un rectangle", [
        "Sélectionne l'outil 'Rectangle'.",
        "Dessine un rectangle en haut de la page.",
        "Choisis une couleur et remplis-le.",
    ], 4)

    tache(doc, 4, "Dessiner et colorier un cœur (forme 'love')", [
        "Sélectionne l'outil 'Cœur' (formes).",
        "Dessine un cœur à côté du rectangle.",
        "Colorie le cœur.",
    ], 3)

    tache(doc, 5, "Dessiner et colorier un triangle", [
        "Sélectionne l'outil 'Triangle'.",
        "Dessine un triangle sous le rectangle.",
        "Colorie le triangle avec une autre couleur.",
    ], 3)

    tache(doc, 6, "Dessiner et colorier une étoile", [
        "Sélectionne l'outil 'Étoile'.",
        "Dessine une étoile en bas de la page.",
        "Colorie l'étoile avec une couleur brillante (jaune, orange…).",
    ], 3)

    tache(doc, 7, "Sauvegarder le travail", [
        "Clique sur 'Fichier' puis 'Enregistrer sous'.",
        "Enregistre ton dessin dans le dossier que tu as créé à la tâche 1.",
        "Donne un nom à ton fichier (exemple : 'MonDessin') et valide.",
    ], 2)

    ajouter_pied(doc)
    doc.save("Examen_Informatique_2eme_Primaire.docx")


if __name__ == "__main__":
    doc_1ere()
    doc_2eme()
    print("Documents générés :")
    print(" - Examen_Informatique_1ere_Primaire.docx")
    print(" - Examen_Informatique_2eme_Primaire.docx")
