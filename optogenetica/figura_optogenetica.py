"""Figura didáctica: ¿Qué es la optogenética y cómo funciona?

Genera figura_optogenetica.png y figura_optogenetica.svg en esta carpeta.
Uso: python3 figura_optogenetica.py
"""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager
from matplotlib.patches import Circle, FancyArrowPatch, FancyBboxPatch, Polygon, Rectangle

# ---------------------------------------------------------------- estilo
# Paleta: cada opsina lleva el color de la luz que la activa, y nada más
# usa esos tonos; el resto de la figura es neutro para que el color signifique algo.
BLUE = "#2563C9"    # ChR2, ~470 nm
GREEN = "#2E9E5B"   # Arch, ~566 nm
AMBER = "#E09A10"   # NpHR, ~590 nm
INK = "#1F2328"
MUTED = "#6B7280"
FAINT = "#E5E7EB"
MEMBRANE = "#E8DFC9"
MEMBRANE_EDGE = "#C9B994"
BG = "#FFFFFF"

for f in ("Inter", "DejaVu Sans"):
    if any(f == x.name for x in font_manager.fontManager.ttflist):
        plt.rcParams["font.family"] = f
        break
plt.rcParams.update({
    "font.size": 10, "axes.edgecolor": MUTED, "axes.labelcolor": INK,
    "xtick.color": MUTED, "ytick.color": MUTED, "text.color": INK,
    "axes.spines.top": False, "axes.spines.right": False, "svg.fonttype": "none",
})


def panel_label(ax, letter, title, subtitle=None):
    ax.text(0, 1.085, letter, transform=ax.transAxes, fontsize=17, fontweight="bold", va="bottom")
    ax.text(0.055, 1.09, title, transform=ax.transAxes, fontsize=12.5, fontweight="semibold", va="bottom")
    if subtitle:
        ax.text(0.055, 1.075, subtitle, transform=ax.transAxes, fontsize=9.5, color=MUTED, va="top")


def arrow(ax, p0, p1, color=INK, lw=1.6, style="-|>", ms=12, **kw):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle=style, mutation_scale=ms, color=color, lw=lw, **kw))


def light_ray(ax, x, y0, y1, color, amp=0.06, n=4):
    """Rayo de luz ondulado que baja de y0 a y1."""
    y = np.linspace(y0, y1, 200)
    xs = x + amp * np.sin(np.linspace(0, n * 2 * np.pi, 200))
    ax.plot(xs, y, color=color, lw=2.2, solid_capstyle="round")
    arrow(ax, (x, y1 + 0.02), (x, y1 - 0.08), color=color, lw=2.2, ms=14)


fig = plt.figure(figsize=(15, 13.5), facecolor=BG)
gs = fig.add_gridspec(3, 6, height_ratios=[1.05, 1.25, 1.0], hspace=0.42, wspace=0.55,
                      left=0.05, right=0.97, top=0.885, bottom=0.04)
fig.text(0.05, 0.965, "Optogenética: controlar neuronas con luz", fontsize=21, fontweight="bold")
fig.text(0.05, 0.94, "Se introduce en neuronas elegidas un gen de alga o arquea que fabrica una proteína sensible a la luz "
         "(opsina). Luego, un destello las enciende o las apaga en milisegundos.", fontsize=11, color=MUTED)

# ================================================================ A. flujo de trabajo
axA = fig.add_subplot(gs[0, :])
axA.set_xlim(0, 16); axA.set_ylim(0, 4); axA.set_aspect("equal"); axA.set_anchor("W"); axA.axis("off")
panel_label(axA, "A", "Los 4 pasos de un experimento")

step_x = [0.3, 4.4, 8.5, 12.6]
step_w = 3.4
steps = [
    ("1  Construir el gen", "Promotor específico + gen de la opsina\n(p. ej. CaMKIIα → solo neuronas excitatorias)"),
    ("2  Entregarlo", "Un virus inofensivo (AAV) se inyecta\nen la región del cerebro de interés"),
    ("3  Expresión selectiva", "Solo las neuronas con ese promotor\nfabrican la opsina en su membrana"),
    ("4  Iluminar", "Una fibra óptica lleva luz láser/LED;\nla neurona responde en ~1 ms"),
]
for i, (x, (t, d)) in enumerate(zip(step_x, steps)):
    axA.add_patch(FancyBboxPatch((x, 0.15), step_w, 3.55, boxstyle="round,pad=0.02,rounding_size=0.18",
                                 fc="#F8F9FA", ec=FAINT, lw=1))
    axA.text(x + 0.18, 3.42, t, fontsize=11, fontweight="semibold", va="top")
    axA.text(x + 0.18, 0.95, d, fontsize=8.2, color=MUTED, va="top", linespacing=1.35)
    if i < 3:
        arrow(axA, (x + step_w + 0.08, 2.1), (step_x[i + 1] - 0.08, 2.1), color=MUTED, lw=1.4)

# 1: ADN
x0 = step_x[0] + 0.35
axA.add_patch(Rectangle((x0, 1.75), 0.95, 0.55, fc=MUTED, ec="none"))
axA.text(x0 + 0.475, 2.025, "promotor", color="white", fontsize=7.5, ha="center", va="center")
axA.add_patch(Rectangle((x0 + 0.95, 1.75), 1.75, 0.55, fc=BLUE, ec="none"))
axA.text(x0 + 1.83, 2.025, "opsina (ChR2)", color="white", fontsize=7.5, ha="center", va="center")
axA.plot([x0 - 0.15, x0 + 2.85], [2.025, 2.025], color=INK, lw=1, zorder=0)

# 2: virus + jeringa
cx, cy = step_x[1] + 1.0, 2.05
hexagon = [(cx + 0.45 * np.cos(a), cy + 0.45 * np.sin(a)) for a in np.linspace(0, 2 * np.pi, 7)[:-1] + np.pi / 6]
axA.add_patch(Polygon(hexagon, fc="white", ec=INK, lw=1.3))
axA.plot([cx - 0.2, cx + 0.2], [cy, cy], color=BLUE, lw=3)
axA.text(cx, cy - 0.7, "AAV", fontsize=8, ha="center", color=MUTED)
arrow(axA, (cx + 0.6, cy), (cx + 1.45, cy), color=MUTED, lw=1.2, ms=10)
bx = step_x[1] + 2.75
axA.add_patch(FancyBboxPatch((bx - 0.45, 1.55), 0.9, 1.0, boxstyle="round,pad=0,rounding_size=0.45",
                             fc="#FCE7EA", ec="#C98B95", lw=1))
axA.text(bx, 1.35, "cerebro", fontsize=7.5, ha="center", color=MUTED)

# 3: neuronas, solo algunas expresan
rng = np.random.default_rng(3)
gx, gy = np.meshgrid(np.arange(3), np.arange(3))
nx = step_x[2] + 0.55 + 1.1 * gx.ravel() + rng.uniform(-0.15, 0.15, 9)
ny = 1.4 + 0.6 * gy.ravel() + rng.uniform(-0.08, 0.08, 9)
on = np.array([1, 0, 1, 0, 0, 1, 0, 1, 0], bool)
for xx, yy, o in zip(nx, ny, on):
    axA.add_patch(Circle((xx, yy), 0.17, fc=BLUE if o else "white", ec=BLUE if o else MUTED, lw=1.2))
axA.add_patch(Circle((step_x[2] + 2.6, 3.0), 0.09, fc=BLUE, ec=BLUE))
axA.text(step_x[2] + 2.75, 3.0, "con opsina", fontsize=7.5, va="center", color=MUTED)

# 4: fibra óptica + cono de luz sobre neurona
fx = step_x[3] + 1.7
axA.add_patch(Rectangle((fx - 0.08, 2.35), 0.16, 0.95, fc=MUTED, ec="none"))
axA.add_patch(Polygon([(fx - 0.08, 2.35), (fx + 0.08, 2.35), (fx + 0.55, 1.45), (fx - 0.55, 1.45)],
                      fc=BLUE, alpha=0.22, ec="none"))
axA.add_patch(Circle((fx, 1.55), 0.2, fc=BLUE, ec=BLUE))
for k in (-1, 1):
    axA.plot([fx + k * 0.3, fx + k * 0.45], [1.8, 1.95], color=BLUE, lw=1.3)
axA.text(fx + 0.25, 3.15, "fibra óptica", fontsize=7.5, color=MUTED, va="center")

# ================================================================ B. las tres opsinas
axB = fig.add_subplot(gs[1, :4])
axB.set_xlim(0, 12); axB.set_ylim(-0.6, 6.0); axB.axis("off")
panel_label(axB, "B", "Tres herramientas, tres colores",
            "Canales que dejan pasar iones vs. bombas que los empujan")
mem_y0, mem_y1 = 2.1, 3.1
axB.add_patch(Rectangle((0.9, mem_y0), 11.0, mem_y1 - mem_y0, fc=MEMBRANE, ec="none"))
for yy in (mem_y0, mem_y1):
    axB.plot([0.9, 11.9], [yy, yy], color=MEMBRANE_EDGE, lw=1.2)
axB.text(0.75, 4.2, "Exterior", fontsize=9, color=MUTED, ha="right", va="center", rotation=90)
axB.text(0.75, 2.6, "Membrana", fontsize=9, color=MUTED, ha="right", va="center", rotation=90)
axB.text(0.75, 1.0, "Interior\n(citoplasma)", fontsize=9, color=MUTED, ha="right", va="center", rotation=90)

opsins = [
    (2.6, "ChR2", "Channelrhodopsina-2", "alga Chlamydomonas", BLUE, "≈470 nm (azul)",
     "Canal de cationes", ["Na⁺", "Ca²⁺"], "in", "Despolariza → dispara", "ACTIVA"),
    (6.4, "NpHR", "Halorhodopsina", "arquea Natronomonas", AMBER, "≈590 nm (amarillo)",
     "Bomba de cloruro", ["Cl⁻"], "in", "Hiperpolariza", "SILENCIA"),
    (10.2, "Arch", "Archaerhodopsina", "arquea Halorubrum", GREEN, "≈566 nm (verde-amarillo)",
     "Bomba de protones", ["H⁺"], "out", "Hiperpolariza", "SILENCIA"),
]
for x, short, name, origin, col, wl, kind, ions, direction, effect, verdict in opsins:
    # proteína
    axB.add_patch(FancyBboxPatch((x - 0.55, mem_y0 - 0.45), 1.1, mem_y1 - mem_y0 + 0.9,
                                 boxstyle="round,pad=0,rounding_size=0.3", fc=col, ec="none"))
    if kind.startswith("Canal"):
        axB.add_patch(Rectangle((x - 0.1, mem_y0 - 0.45), 0.2, mem_y1 - mem_y0 + 0.9, fc="white", ec="none"))
    axB.text(x, mem_y0 + 0.5, short, color="white" if kind.startswith("Bomba") else INK,
             fontsize=10, fontweight="bold", ha="center", va="center",
             bbox=None if kind.startswith("Bomba") else dict(boxstyle="round,pad=0.15", fc="white", ec="none"))
    # luz
    light_ray(axB, x - 0.9, 5.2, 3.85, col)
    axB.text(x - 0.9, 5.42, wl, color=col, fontsize=9, fontweight="semibold", ha="center")
    # iones
    for j, ion in enumerate(ions):
        ix = x + 0.85 + 0.55 * j
        if direction == "in":
            arrow(axB, (ix, 4.3), (ix, 1.1), color=INK, lw=1.4, ms=11)
            axB.text(ix, 4.45, ion, fontsize=10, ha="center", fontweight="semibold")
        else:
            arrow(axB, (ix, 1.1), (ix, 4.3), color=INK, lw=1.4, ms=11)
            axB.text(ix, 4.45, ion, fontsize=10, ha="center", fontweight="semibold")
    # descripción
    axB.text(x, 0.35, f"{name}", fontsize=10, fontweight="semibold", ha="center")
    axB.text(x, 0.0, f"{kind} · de {origin}", fontsize=8.3, color=MUTED, ha="center")
    axB.text(x, -0.4, f"{effect}  ", fontsize=9, ha="right", va="center")
    axB.text(x, -0.4, f" {verdict}", fontsize=9.5, ha="left", va="center", fontweight="bold", color=col,
             bbox=dict(boxstyle="round,pad=0.25", fc="white", ec=col, lw=1.1))

# ================================================================ C. espectros
axC = fig.add_subplot(gs[1, 4:])
panel_label(axC, "C", "Cada opsina \"escucha\" un color", "Espectros esquemáticos: picos separados permiten\nencender un grupo con azul y apagar otro con amarillo")
wl = np.linspace(380, 700, 500)


def spectrum(peak, sl, sr):
    s = np.where(wl < peak, sl, sr)
    return np.exp(-0.5 * ((wl - peak) / s) ** 2)


for peak, sl, sr, col, lab, lx in [(470, 38, 42, BLUE, "ChR2", 470), (566, 48, 40, GREEN, "Arch", 548),
                                   (589, 50, 38, AMBER, "NpHR", 610)]:
    y = spectrum(peak, sl, sr)
    axC.fill_between(wl, y, color=col, alpha=0.12, lw=0)
    axC.plot(wl, y, color=col, lw=2.2)
    axC.text(lx, 1.04, lab, color=col, fontsize=10, fontweight="bold", ha="center")
# franja del espectro visible
from matplotlib.colors import LinearSegmentedColormap
vis = LinearSegmentedColormap.from_list("vis", ["#6A0DAD", "#2B3FFF", "#00A6FF", "#00C060",
                                               "#E6E600", "#FF9A00", "#E00000"])
axC.imshow(np.linspace(0, 1, 300)[None, :], extent=(380, 700, -0.13, -0.05), aspect="auto", cmap=vis)
axC.set_xlim(380, 700); axC.set_ylim(-0.15, 1.15)
axC.set_yticks([0, 0.5, 1]); axC.spines["bottom"].set_bounds(380, 700)
axC.set_xlabel("Longitud de onda de la luz (nm)")
axC.set_ylabel("Activación relativa")

# ================================================================ D. registros eléctricos
axD = fig.add_subplot(gs[2, :3])
panel_label(axD, "D", "Lo que se mide: voltaje de la neurona", "Simulación ilustrativa")
dt = 0.1e-3
t = np.arange(0, 3.0, dt)


def spike_shape():
    tt = np.arange(0, 6e-3, dt)
    return 100 * np.exp(-((tt - 1e-3) / 0.35e-3) ** 2) - 12 * np.exp(-(tt - 1.5e-3) / 2.5e-3) * (tt > 1.5e-3)


SPK = spike_shape()


def trace(spike_times, base):
    v = base.copy() + rng.normal(0, 0.4, t.size)
    for st in spike_times:
        i = int(st / dt)
        n = min(SPK.size, v.size - i)
        v[i:i + n] += SPK[:n]
    return v


# Fila superior: ChR2 + pulsos azules 10 Hz entre 1 y 2 s
pulses = np.arange(1.0, 2.0, 0.1)
v1 = trace(pulses + 0.002, np.full(t.size, -70.0))
# Fila inferior: NpHR, disparo espontáneo, luz amarilla 1–2 s lo silencia
spont = np.sort(rng.uniform(0, 3, 26))
spont = spont[(spont < 0.98) | (spont > 2.06)]
base2 = np.full(t.size, -62.0)
on2 = (t >= 1.0) & (t <= 2.0)
base2[on2] = -62 - 18 * (1 - np.exp(-(t[on2] - 1.0) / 0.03))
off = t > 2.0
base2[off] = -62 - 18 * np.exp(-(t[off] - 2.0) / 0.04)
v2 = trace(spont, base2)

off1, off2 = 0, -178
for p in pulses:
    axD.add_patch(Rectangle((p, 45), 0.012, 12, fc=BLUE, ec="none"))
axD.plot(t, v1 + off1, color=INK, lw=0.8)
axD.add_patch(Rectangle((1.0, off2 + 56), 1.0, 9, fc=AMBER, ec="none"))
axD.plot(t, v2 + off2 + 8, color=INK, lw=0.8)
axD.text(-0.05, -70 + off1, "ChR2\n+ luz azul", fontsize=9.5, color=BLUE, fontweight="semibold", ha="right", va="center")
axD.text(-0.05, -62 + off2 + 8, "NpHR\n+ luz amarilla", fontsize=9.5, color=AMBER, fontweight="semibold", ha="right", va="center")
axD.text(1.5, 62, "cada destello → 1 potencial de acción", fontsize=8.5, ha="center", color=MUTED)
axD.text(1.5, off2 + 69, "luz encendida → silencio", fontsize=8.5, ha="center", color=MUTED)
# barras de escala
axD.plot([2.95, 3.25], [off2 - 85, off2 - 85], color=INK, lw=1.5)
axD.text(3.1, off2 - 89, "300 ms", fontsize=8, ha="center", va="top")
axD.plot([3.25, 3.25], [off2 - 85, off2 - 45], color=INK, lw=1.5)
axD.text(3.28, off2 - 65, "40 mV", fontsize=8, va="center")
axD.set_xlim(-0.55, 3.45); axD.set_ylim(off2 - 105, 75); axD.axis("off")

# ================================================================ E. historia
axE = fig.add_subplot(gs[2, 3:])
axE.set_xlim(1997.5, 2024); axE.set_ylim(-4.0, 3.6); axE.axis("off")
panel_label(axE, "E", "Breve historia")
axE.plot([2001, 2022.5], [0, 0], color=MUTED, lw=1.5)
events = [
    (2002, "Descubren ChR1 en un alga\n(Nagel, Hegemann y cols.)", 1, MUTED, "right"),
    (2003, "ChR2: canal activado\npor luz azul", -1, BLUE, "center"),
    (2005, "Primeras neuronas\ncontroladas con luz\n(Boyden, Deisseroth y cols.)", 2.2, BLUE, "center"),
    (2007, "NpHR: apagar\nneuronas con luz\namarilla", -2.2, AMBER, "center"),
    (2010, "Arch · \"Método del año\"\nde Nature Methods", 1, GREEN, "center"),
    (2021, "Primer paciente ciego\nrecupera visión parcial\n(ChrimsonR, Sahel y cols.)", -1, INK, "center"),
]
for yr, txt, h, col, ha in events:
    axE.plot([yr, yr], [0, h * 0.75], color=col, lw=1.2)
    axE.scatter([yr], [0], s=70, color=col, ec="white", lw=1.5, zorder=3)
    axE.text(yr, h * 0.75 + (0.12 if h > 0 else -0.12), f"{yr}", fontsize=9.5, fontweight="bold",
             color=col, ha="center", va="bottom" if h > 0 else "top")
    axE.text(yr + (0.6 if ha == "right" else 0), h * 0.75 + (0.62 if h > 0 else -0.62), txt, fontsize=8.2,
             color=INK, ha=ha,
             va="bottom" if h > 0 else "top", linespacing=1.25)

out = Path(__file__).with_suffix("")
fig.savefig(f"{out}.png", dpi=200, facecolor=BG)
fig.savefig(f"{out}.svg", facecolor=BG)
print("ok", out)
