# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.1 read-only evidence check. Writes only to $SHARPWALK_WORK (default ./work, git-ignored).
# Run with Python 3.11.18 and rasterio 1.4.4 / numpy 2.4.6. Not part of the production pipeline (1.2).
import os
WORK = os.environ.get("SHARPWALK_WORK", "work")
os.makedirs(WORK, exist_ok=True)
import rasterio, numpy as np, math, json, hashlib
R=3396190.0
p=f"{WORK}/d1_aoi_crop.tif"
with rasterio.open(p) as ds:
    a=ds.read(1).astype("float64"); T=ds.transform; nd=ds.nodata
# AOI mask (exclude pad)
rows,cols=a.shape
xs=T.c+T.a*(np.arange(cols)+0.5); ys=T.f+T.e*(np.arange(rows)+0.5)
lon=np.degrees(xs/R); lat=np.degrees(ys/R)
inlon=(lon>=137.365)&(lon<=137.415); inlat=(lat>=-4.840)&(lat<=-4.790)
m=np.outer(inlat,inlon)
valid=a!=nd
print("AOI cells",m.sum(),"NoData in AOI",(m&~valid).sum(), f"{100*(m&~valid).sum()/m.sum():.4f}%")
z=np.where(valid,a,np.nan)
print("elev min/max in AOI", np.nanmin(z[m]), np.nanmax(z[m]))
# slope (east-west pixel = 1 m * cos(lat)? Source is equirect true at equator: 1 m N-S, 0.9965 m E-W at -4.8)
dx=1.0*math.cos(math.radians(4.815)); dy=1.0
gy,gx=np.gradient(z,dy,dx)
slope=np.degrees(np.arctan(np.hypot(gx,gy)))
print("slope pct>20deg",f"{100*np.nanmean(slope[m]>20):.2f}%"," >60deg",int(np.nansum(slope[m]>60)))
# hillshade
az,alt=math.radians(315),math.radians(45)
asp=np.arctan2(-gx,gy)
hs=np.sin(alt)*np.cos(np.radians(slope))+np.cos(alt)*np.sin(np.radians(slope))*np.cos(az-asp)
# roughness: std of residual from 9x9 mean, per 50 m block
from numpy.lib.stride_tricks import sliding_window_view as sw
k=9
pad=np.pad(z,k//2,mode='edge'); mean=sw(pad,(k,k)).mean(axis=(-1,-2))
res=z-mean
B=50
rb=rows//B; cb=cols//B
rough=np.nanstd(res[:rb*B,:cb*B].reshape(rb,B,cb,B),axis=(1,3))
print("roughness(std of 9x9 high-pass, m) per 50 m block: p5/p50/p95", np.nanpercentile(rough,[5,50,95]).round(3))
print("blocks with roughness<0.05 m (smooth, fill-like):", f"{100*np.mean(rough<0.05):.1f}%")
np.save(f"{WORK}/rough.npy",rough)
# images
import zlib,struct
def png(path,arr):
    arr=np.clip(arr,0,255).astype(np.uint8); h,w=arr.shape
    raw=b''.join(b'\x00'+arr[i].tobytes() for i in range(h))
    def ch(t,d): c=struct.pack('>I',len(d))+t+d; return c+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,0,0,0,0))+ch(b'IDAT',zlib.compress(raw,6))+ch(b'IEND',b''))
h=np.nan_to_num(hs,nan=0)*255
png(f"{WORK}/hillshade_full.png",h[::4,::4])
r0,c0=rows//2-300,cols//2-300
png(f"{WORK}/hillshade_zoom600m.png",h[r0:r0+600,c0:c0+600])
rimg=np.clip(rough/np.nanpercentile(rough,99)*255,0,255)
png(f"{WORK}/roughness_50m.png",np.kron(rimg,np.ones((8,8))))
print("sha256 crop", hashlib.sha256(open(p,'rb').read()).hexdigest())
