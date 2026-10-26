"""Isolated image-analysis candidate. Human-known pixel scale required. Not provider-qualified."""
import argparse
import json
import platform
from pathlib import Path
import cv2
import numpy as np

def analyze(path, reference=None):
    src = cv2.imread(str(path))
    if src is None:
        return {"decision":"REQUEST_VALID_IMAGE","reason":"image_decode_failed"}
    gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray,100,255,cv2.THRESH_BINARY_INV)
    contours,_ = cv2.findContours(mask,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
    candidates=[]
    for contour in contours:
        perimeter=cv2.arcLength(contour,True)
        poly=cv2.approxPolyDP(contour,0.025*perimeter,True)
        if len(poly)!=4 or cv2.contourArea(poly)<2500: continue
        pts=poly[:,0,:].astype(float)
        sides=[float(np.linalg.norm(pts[(i+1)%4]-pts[i])) for i in range(4)]
        candidates.append((cv2.contourArea(poly),pts,sides))
    if not candidates:
        return {"decision":"REQUEST_RECAPTURE","reason":"no_usable_room_quadrilateral"}
    _,pts,sides=max(candidates,key=lambda v:v[0])
    if reference is None or reference.get("known_metres",0)<=0:
        return {"decision":"REQUEST_SCALE","reason":"no_verified_metric_reference","polygon_px":pts.tolist()}
    a,b=np.array(reference["pixel_endpoints"],dtype=float)
    span=float(np.linalg.norm(b-a))
    if span<10:
        return {"decision":"REQUEST_SCALE","reason":"invalid_reference_span"}
    px_per_m=span/float(reference["known_metres"])
    opposite=[abs(sides[i]-sides[(i+2)%4])/max(sides[i],sides[(i+2)%4]) for i in (0,1)]
    if max(opposite)>0.08:
        return {"decision":"REQUEST_RECTIFICATION","reason":"perspective_or_skew_uncertain","polygon_px":pts.tolist(),"opposite_edge_error":max(opposite)}
    dim_a=(sides[0]+sides[2])/(2*px_per_m)
    dim_b=(sides[1]+sides[3])/(2*px_per_m)
    return {"decision":"CALL_ACTUAL_QUANTITY_TOOL","length_m":round(max(dim_a,dim_b),4),"width_m":round(min(dim_a,dim_b),4),"polygon_px":pts.tolist(),"pixels_per_metre":round(px_per_m,4),"opencv_version":cv2.__version__,"platform":platform.platform(),"note":"provisional; physical scale and contour require human review"}

def fixture(path,perspective=False):
    img=np.full((760,900,3),255,dtype=np.uint8)
    pts=np.array([[120,120],[720,120],[720,520],[120,520]],dtype=np.int32)
    if perspective: pts[1]=[680,160]
    cv2.polylines(img,[pts],True,(0,0,0),5)
    cv2.line(img,(120,650),(320,650),(0,0,0),5)
    cv2.imwrite(str(path),img)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--image",required=True)
    p.add_argument("--fixture",action="store_true")
    p.add_argument("--perspective",action="store_true")
    p.add_argument("--known-metres",type=float)
    args=p.parse_args()
    if args.fixture: fixture(args.image,args.perspective)
    ref={"known_metres":args.known_metres,"pixel_endpoints":[[120,650],[320,650]]} if args.known_metres else None
    print(json.dumps(analyze(args.image,ref),indent=2))
