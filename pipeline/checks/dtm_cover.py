# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.1 read-only evidence check. Writes only to $SHARPWALK_WORK (default ./work, git-ignored).
# Run with Python 3.11.18 and rasterio 1.4.4 / numpy 2.4.6. Not part of the production pipeline (1.2).
import os
WORK = os.environ.get("SHARPWALK_WORK", "work")
os.makedirs(WORK, exist_ok=True)
import sys
cols={'PRODUCT_ID':(128,33),'RATIONALE':(205,75),'LEFT':(283,15),'RIGHT':(301,15),'TYPE':(355,16),
'MINLAT':(398,10),'MAXLAT':(409,10),'MINLON':(420,10),'MAXLON':(431,10),'SCALE':(442,5),'PROJ':(460,19),
'C1LAT':(522,10),'C1LON':(533,10),'C2LAT':(544,10),'C2LON':(555,10),'C3LAT':(566,10),'C3LON':(577,10),'C4LAT':(588,10),'C4LON':(599,10),'FILE':(15,94)}
def f(line,k):
    s,n=cols[k]; return line[s-1:s-1+n].strip().strip('"').strip()
AOI=(-4.840,-4.790,137.365,137.415)
def inside(pt,poly):
    x,y=pt; c=False
    for i in range(len(poly)):
        x1,y1=poly[i]; x2,y2=poly[i-1]
        if (y1>y)!=(y2>y) and x < (x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
for line in open(sys.argv[1],encoding='latin-1'):
    try:
        mnla,mxla,mnlo,mxlo=[float(f(line,k)) for k in('MINLAT','MAXLAT','MINLON','MAXLON')]
    except ValueError: continue
    if mxla<AOI[0] or mnla>AOI[1] or mxlo<AOI[2] or mnlo>AOI[3]: continue
    poly=[(float(f(line,f'C{i}LON')),float(f(line,f'C{i}LAT'))) for i in range(1,5)]
    corners=[(lo,la) for la in AOI[:2] for lo in AOI[2:]]
    n_in=sum(inside(c,poly) for c in corners)
    print(f"{f(line,'PRODUCT_ID'):34s} {f(line,'TYPE'):14s} scale={f(line,'SCALE'):>5s} lat[{mnla:.3f},{mxla:.3f}] lon[{mnlo:.3f},{mxlo:.3f}] AOIcornersInside={n_in}/4 | {f(line,'RATIONALE')[:45]}")
