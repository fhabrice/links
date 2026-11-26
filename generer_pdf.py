#!/usr/bin/env python3
"""Génère les questionnaires d'examen d'informatique (1ère et 2ème primaire)
   du Complexe Scolaire Un Jour Nouveau au format PDF, sur UNE SEULE page A4,
   en noir et blanc (sans la grille de pondération), avec une police Unicode
   (DejaVuSans) pour les accents français.
   L'élève remplit son nom, son numéro, sa classe et le lieu."""

from fpdf import FPDF
from fpdf.enums import XPos, YPos

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

SCHOOL = "COMPLEXE SCOLAIRE UN JOUR NOUVEAU"
MATIERE = "INFORMATIQUE"
NOIR = (0, 0, 0)
GRIS = (90, 90, 90)
GRIS_FOND = (224, 224, 224)
BLANC = (255, 255, 255)


class ExamenPDF(FPDF):
    def footer(self):
        self.set_y(-8)
        self.set_font("DejaVu", "", 6.5)
        self.set_text_color(*GRIS)
        self.cell(0, 5, f"{SCHOOL} — Examen {MATIERE} — Année scolaire 2025-2026",
                  align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(*NOIR)


def titre_centre(pdf, texte, taille, gras=True, apres=1.5, avant=0):
    pdf.set_font("DejaVu", "B" if gras else "", taille)
    pdf.set_text_color(*NOIR)
    pdf.ln(avant)
    pdf.cell(0, taille * 0.45 + 1.5, texte, align="C",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(apres)


def en_tete(pdf, classe, titre_examen):
    titre_centre(pdf, SCHOOL, 13, avant=1)
    titre_centre(pdf, f"Examen de {MATIERE} — {classe}", 10.5, apres=0.5)
    titre_centre(pdf, titre_examen, 9, gras=False, apres=2)

    pdf.set_font("DejaVu", "", 8)
    ligs = [
        [("Nom et prénom de l'élève", "", "Numéro", "")],
        [("Classe", "", "Lieu de l'examen", "")],
    ]
    for lig in ligs:
        y = pdf.get_y()
        x = pdf.l_margin
        wlib1, wval1, wlib2, wval2 = 48, 42, 28, 62
        pdf.set_xy(x, y)
        pdf.set_fill_color(*GRIS_FOND)
        pdf.multi_cell(wlib1, 6, lig[0][0], border=1, align="L", fill=True,
                       new_x=XPos.RIGHT, new_y=YPos.TOP, max_line_height=6)
        pdf.set_xy(x + wlib1, y)
        pdf.multi_cell(wval1, 6, lig[0][1], border=1, align="L",
                       new_x=XPos.RIGHT, new_y=YPos.TOP, max_line_height=6)
        pdf.set_xy(x + wlib1 + wval1, y)
        pdf.set_fill_color(*GRIS_FOND)
        pdf.multi_cell(wlib2, 6, lig[0][2], border=1, align="L", fill=True,
                       new_x=XPos.RIGHT, new_y=YPos.TOP, max_line_height=6)
        pdf.set_xy(x + wlib1 + wval1 + wlib2, y)
        pdf.multi_cell(wval2, 6, lig[0][3], border=1, align="L",
                       new_x=XPos.LMARGIN, new_y=YPos.NEXT, max_line_height=6)
    pdf.ln(2)


def consigne(pdf, texte):
    pdf.set_font("DejaVu", "B", 9.5)
    pdf.set_text_color(*NOIR)
    pdf.cell(0, 5, "CONSIGNES GÉNÉRALES", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("DejaVu", "", 8)
    pdf.multi_cell(0, 4, texte, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(0.5)


def tache(pdf, numero, titre, etapes, points):
    y = pdf.get_y()
    pdf.set_font("DejaVu", "B", 9.5)
    pdf.set_text_color(*NOIR)
    # Points à droite (à côté de la tâche)
    pdf.set_xy(pdf.l_margin + 160, y)
    pdf.cell(24, 4.6, f"{points} pts", align="R",
             new_x=XPos.LMARGIN, new_y=YPos.TOP)
    # Titre de la tâche à gauche
    pdf.set_xy(pdf.l_margin, y)
    pdf.multi_cell(158, 4.6, f"TÂCHE {numero} : {titre}",
                   new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("DejaVu", "", 8)
    for i, etape in enumerate(etapes, 1):
        pdf.set_x(pdf.l_margin)
        pdf.cell(5, 4, f"{i}.")
        pdf.multi_cell(0, 4, etape, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(0.5)


def build(classe, titre_examen, texte_consigne, taches, fichier):
    pdf = ExamenPDF(orientation="P", unit="mm", format="A4")
    pdf.add_font("DejaVu", "", FONT)
    pdf.add_font("DejaVu", "B", FONT_B)
    pdf.add_font("DejaVu", "I", FONT)
    pdf.set_auto_page_break(auto=True, margin=10)
    pdf.set_margins(12, 10, 12)
    pdf.add_page()
    en_tete(pdf, classe, titre_examen)
    consigne(pdf, texte_consigne)
    for t in taches:
        tache(pdf, *t)
    pdf.output(fichier)
    print("Généré :", fichier)


# ============================================================
# 1ère PRIMAIRE
# ============================================================
build(
    "1ère PRIMAIRE",
    "Ouverture de Paint et dessins",
    "Cet examen se passe sur l'ordinateur. Lis chaque tâche calmement et "
    "réalise-la à l'écran. L'enseignant t'observe et note ce que tu réussis. "
    "N'oublie pas de bien écrire ton nom.",
    [
        (1, "Allumer l'ordinateur", [
            "Appuie sur le bouton d'allumage de l'ordinateur.",
            "Attends que l'écran s'allume et que le Bureau (Windows) apparaisse.",
            "Vérifie que le système est prêt à être utilisé.",
        ], 4),
        (2, "Ouvrir l'application Paint", [
            "Clique sur le bouton 'Démarrer' (en bas à gauche).",
            "Cherche le programme 'Paint' et clique dessus pour l'ouvrir.",
            "Vérifie que la fenêtre de Paint s'affiche à l'écran.",
        ], 5),
        (3, "Dessiner et colorier un rectangle", [
            "Choisis l'outil 'Rectangle' dans la barre d'outils.",
            "Dessine un grand rectangle au milieu de la page.",
            "Choisis une couleur dans la palette et remplis le rectangle.",
        ], 6),
        (4, "Dessiner et colorier un cœur (forme 'love')", [
            "Cherche l'outil qui dessine un cœur (ou utilise les formes).",
            "Dessine un cœur sous le rectangle.",
            "Colorie le cœur avec la couleur de ton choix (rouge, rose…).",
        ], 5),
    ],
    "Examen_Informatique_1ere_Primaire.pdf",
)

# ============================================================
# 2ème PRIMAIRE
# ============================================================
build(
    "2ème PRIMAIRE",
    "Dossier Windows, Paint et formes géométriques",
    "Cet examen se passe sur l'ordinateur. Réalise chaque tâche dans l'ordre, "
    "en suivant les étapes. L'enseignant note tes réussites. Sois soigné dans "
    "tes dessins et tes couleurs.",
    [
        (1, "Créer un dossier dans Windows", [
            "Allume l'ordinateur et attends le Bureau (Windows).",
            "Ouvre 'Ce PC' (ou 'Poste de travail') depuis le Bureau.",
            "Va dans le dossier 'Documents'.",
            "Clique droit → 'Nouveau' → 'Dossier'.",
            "Nomme le dossier avec ton nom et prénom, puis valide.",
        ], 4),
        (2, "Ouvrir l'application Paint", [
            "Clique sur 'Démarrer' puis recherche 'Paint'.",
            "Ouvre Paint et attends que la page blanche apparaisse.",
        ], 3),
        (3, "Dessiner et colorier un rectangle", [
            "Sélectionne l'outil 'Rectangle'.",
            "Dessine un rectangle en haut de la page.",
            "Choisis une couleur et remplis-le.",
        ], 4),
        (4, "Dessiner et colorier un cœur (forme 'love')", [
            "Sélectionne l'outil 'Cœur' (formes).",
            "Dessine un cœur à côté du rectangle.",
            "Colorie le cœur.",
        ], 3),
        (5, "Dessiner et colorier un triangle", [
            "Sélectionne l'outil 'Triangle'.",
            "Dessine un triangle sous le rectangle.",
            "Colorie le triangle avec une autre couleur.",
        ], 3),
        (6, "Dessiner et colorier une étoile", [
            "Sélectionne l'outil 'Étoile'.",
            "Dessine une étoile en bas de la page.",
            "Colorie l'étoile avec une couleur brillante (jaune, orange…).",
        ], 3),
        (7, "Sauvegarder le travail", [
            "Clique sur 'Fichier' puis 'Enregistrer sous'.",
            "Enregistre ton dessin dans le dossier que tu as créé à la tâche 1.",
            "Donne un nom à ton fichier (exemple : 'MonDessin') et valide.",
        ], 2),
    ],
    "Examen_Informatique_2eme_Primaire.pdf",
)
