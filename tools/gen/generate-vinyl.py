"""LumaRaf · özgün plak çıtırtısı sentezi (üçüncü taraf örnek yok).
Kullanım: python3 tools/gen/generate-vinyl.py out.wav"""
import sys, wave, numpy as np
SR=44100; DUR=32.0; rng=np.random.default_rng(57057)
n=int(SR*DUR); t=np.arange(n)/SR
# yumuşak yüzey hışırtısı: filtrelenmiş pembe gürültü
w=rng.standard_normal(n); b=np.zeros(n); acc=0.0
for i in range(n): acc=0.985*acc+0.015*w[i]; b[i]=acc
hiss=(w*0.012+b*0.22)
# dönen plak: 33⅓ dev/dk ≈ 0.555 Hz hafif modülasyon
hiss*=1+0.25*np.sin(2*np.pi*0.5555*t)
# çıtırtılar
crack=np.zeros(n)
for _ in range(int(DUR*9)):
    p=rng.integers(0,n-400); a=rng.uniform(.05,.35)*(1 if rng.random()<.85 else 2.2)
    L=rng.integers(20,260); env=np.exp(-np.arange(L)/rng.uniform(4,40))
    crack[p:p+L]+=a*env*rng.choice([-1,1])*rng.uniform(.6,1,L)
# döngü sınırında yumuşak geçiş
x=hiss+crack; f=int(SR*.6); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f)
x=x/np.max(np.abs(x))*0.5
with wave.open(sys.argv[1],'wb') as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((x*32767).astype('<i2').tobytes())
