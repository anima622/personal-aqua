export const phaseResearch = [
  {
    "slug": "drop",
    "label": "01 / DROP",
    "title": "落下の速さと形",
    "papers": [
      {
        "id": "drop-terminal",
        "title": "雨粒は、どこまでも速くなる？",
        "original": "Terminal Velocity and Shape of Cloud and Precipitation Drops Aloft",
        "authors": "K. V. Beard · 1976 · Journal of the Atmospheric Sciences",
        "url": "https://doi.org/10.1175/1520-0469(1976)033<0851:TVASOC>2.0.CO;2",
        "method": "理論・実験に基づく整理",
        "scope": "空気中を落下する雲粒・雨粒。大きさに応じた3つの流れの領域。",
        "summary": "粒の大きさと周囲の空気の性質から、終端速度を求める式を整理した研究です。落下の速さは重力だけでは決まらず、空気から受ける抵抗にも左右されます。",
        "meaning": "落ちるほど速くなる、という見方には限界があります。十分な落下距離があれば、力がつり合う速さに近づきます。映像の短い落下が終端速度に達したとは判断できません。"
      },
      {
        "id": "drop-shape",
        "title": "落ちる水滴は、丸いまま？",
        "original": "Shapes and oscillations of falling raindrops — A review",
        "authors": "M. Szakállほか · 2010 · Atmospheric Research",
        "url": "https://doi.org/10.1016/j.atmosres.2010.03.024",
        "method": "レビュー論文",
        "scope": "風洞・落下実験・自然の雨粒を扱う既存研究の整理。",
        "summary": "雨粒の形と振動を、実験・観測・理論から整理しています。静止した平均形と、振動しながら刻々と変わる形を区別することが重要です。",
        "meaning": "水滴は硬い球ではありません。輪郭の変化を観察すると、表面をまとめる力と周囲の空気の影響へ関心が広がります。この論文は新しい一つの実験ではなくレビューです。"
      },
      {
        "id": "drop-simulation",
        "title": "小さな雨粒の速さを、計算で確かめる",
        "original": "The Terminal Velocity of Axisymmetric Cloud Drops and Raindrops Evaluated by the Immersed Boundary Method",
        "authors": "C. R. Ong・H. Miura・M. Koike · 2021 · Journal of the Atmospheric Sciences",
        "url": "https://doi.org/10.1175/JAS-D-20-0161.1",
        "method": "数値研究",
        "scope": "直径0.025〜0.5 mmの軸対称な水滴。温度・気圧なども検討。",
        "summary": "空気と水を一緒に計算するモデルで、小さな水滴の終端速度を調べ、既存の実験や推定式と比較しています。",
        "meaning": "「雨粒の速度」を一つの数字に固定せず、大きさや環境条件から考える研究です。軸対称という計算条件や対象サイズがあるため、画面上の滴の速度を直接求める資料ではありません。"
      }
    ]
  },
  {
    "slug": "impact",
    "label": "02 / IMPACT",
    "title": "接触と水面下のくぼみ",
    "papers": [
      {
        "id": "impact-air",
        "title": "触れる瞬間、空気はどこへ？",
        "original": "Air entrapment under an impacting drop",
        "authors": "S. T. Thoroddsen・T. G. Etoh・K. Takehara · 2003 · Journal of Fluid Mechanics",
        "url": "https://doi.org/10.1017/S0022112002003427",
        "method": "高速撮影実験",
        "scope": "液滴が液面へ衝突する、ごく短い接触過程。",
        "summary": "液面との接触が輪状に起き、中央に薄い空気の層が残る様子を高速撮影しています。その空気層が縮み、気泡になる過程を調べました。",
        "meaning": "目で見える水面の変形だけでなく、滴と水面の間の空気も着水に関係します。生成映像から、この微細な空気層の有無を判定することはできません。"
      },
      {
        "id": "impact-cavity",
        "title": "水面のくぼみは、どこまで深くなる？",
        "original": "Crater evolution after the impact of a drop onto a semi-infinite liquid target",
        "authors": "A. Bisighiniほか · 2010 · Physical Review E",
        "url": "https://doi.org/10.1103/PhysRevE.82.036319",
        "method": "実験・理論",
        "scope": "同じ液体の滴と、十分に深い液体。モデルは十分に大きいWe・Fr・Reを対象。",
        "summary": "高速撮影したくぼみの形と、慣性・重力・表面張力を含むモデルを比較し、深さが時間とともに変わる様子を調べています。",
        "meaning": "着水は一瞬で終わるのではなく、くぼみが広がる過程へ続きます。浅い容器や粘りの強い液体へ、そのまま同じ予測を使うことはできません。"
      },
      {
        "id": "impact-bubble",
        "title": "くぼみの中に、気泡が残るのはなぜ？",
        "original": "Cavity deformation and bubble entrapment during the impact of droplets on a liquid pool",
        "authors": "Z. Xu・T. Wang・Z. Che · 2022 · Physical Review E",
        "url": "https://doi.org/10.1103/PhysRevE.106.055108",
        "method": "実験・数値研究",
        "scope": "液滴の液面衝突。重力・周囲圧力を変えた条件も比較。",
        "summary": "くぼみに沿って進む毛管波による小さな気泡の切り離しと、入口の王冠が閉じて大きな気泡を包む場合を区別しています。",
        "meaning": "水面の下では、くぼみの形と閉じ方によって異なることが起きます。すべての着水で同じ気泡が生じるわけではありません。"
      }
    ]
  },
  {
    "slug": "crown",
    "label": "03 / CROWN",
    "title": "王冠の成長と分裂",
    "papers": [
      {
        "id": "crown-coupling",
        "title": "王冠とくぼみは、つながっている",
        "original": "Splash on a liquid pool: coupled cavity–sheet unsteady dynamics",
        "authors": "R. Dandekarほか · 2025（オンライン2024）· Journal of Fluid Mechanics",
        "url": "https://doi.org/10.1017/jfm.2024.1105",
        "method": "実験・理論",
        "scope": "深い液体で王冠が形成される領域。理論は粘性を無視する近似。",
        "summary": "水面下のくぼみと上の薄い水膜を連動させ、王冠の高さや膜の変化を説明するモデルを実験と比較しています。",
        "meaning": "表面張力は王冠を持ち上げるだけの力ではなく、上昇を抑える側にも働きます。上下を一緒に観察することが、この研究を読む入口です。"
      },
      {
        "id": "crown-rim",
        "title": "王冠の縁は、なぜ小さな滴に分かれる？",
        "original": "Growth and instability of the liquid rim in the crown splash regime",
        "authors": "G. Agbaglah・R. D. Deegan · 2014 · Journal of Fluid Mechanics",
        "url": "https://doi.org/10.1017/jfm.2014.240",
        "method": "数値計算・安定性解析",
        "scope": "同じ液体の薄い膜への衝突。We < 1000、Re < 2000。深い水面とは異なる条件。",
        "summary": "王冠の縁から伸びる細い流れと滴への分裂を調べています。慣性と表面張力の競合に加え、縁の減速も不安定さの成長に関係します。",
        "meaning": "縁の小さな凹凸が育ち、細く伸びて分かれる見方を得られます。ただし薄膜の研究なので、この映像の王冠の滴数を予測する根拠にはしません。"
      },
      {
        "id": "crown-regime",
        "title": "どんな一滴にも、王冠はできる？",
        "original": "Investigation of droplets impinging on a deep pool: transition from coalescence to jetting",
        "authors": "H. Zhao・A. Brunsvold・S. T. Munkejord · 2011（オンライン2010）· Experiments in Fluids",
        "url": "https://doi.org/10.1007/s00348-010-0966-1",
        "method": "実験",
        "scope": "深い液体へ衝突する1 mm未満の滴。5種類の液体を比較。",
        "summary": "滴が液面に合体する場合と、ジェットや飛散が現れる場合を調べています。大きさ・速度・液体の性質を組み合わせて、変化の境界を整理しました。",
        "meaning": "水が弾ける形は一種類ではありません。王冠ができることを当然とせず、どんな条件で形が変わるかを考える比較資料です。"
      }
    ]
  },
  {
    "slug": "ripple",
    "label": "04 / RIPPLE",
    "title": "波の広がりと減衰",
    "papers": [
      {
        "id": "ripple-rings",
        "title": "波紋に、いくつもの輪がある理由",
        "original": "Gravity–capillary rings generated by water drops",
        "authors": "B. Le Méhauté · 1988 · Journal of Fluid Mechanics",
        "url": "https://doi.org/10.1017/S0022112088003301",
        "method": "理論研究",
        "scope": "初め静かな水面への小さな物体の衝突。線形波の重ね合わせ。",
        "summary": "重力・表面張力・粘性を含め、水滴などが作る波紋を時間と距離の関数として記述しています。波の成分によって伝わり方が違います。",
        "meaning": "一本の輪が広がるだけでなく、異なる波の成分が重なった列として観察できます。大きく砕ける王冠の全過程を説明する理論ではありません。"
      },
      {
        "id": "ripple-energy",
        "title": "落下のエネルギーは、全部波になる？",
        "original": "Ring-Waves Generated by Water Drops Impacting on Water Surfaces at Rest",
        "authors": "C. Craeye・P. W. Sobieski・L. F. Bliven・A. Guissard · 1999 · IEEE Journal of Oceanic Engineering",
        "url": "https://doi.org/10.1109/48.775294",
        "method": "波面の測定実験",
        "scope": "直径2.2 mm・2.8 mmの滴。初め静かな淡水・塩水。",
        "summary": "波面の形を測定し、この実験条件では波紋に移るエネルギーが入射運動エネルギーのおよそ1%程度だったと報告しています。",
        "meaning": "波紋は目に付きますが、着水のエネルギーのすべてではありません。この割合は条件付きの測定結果であり、どんな水滴にも当てはまる一定値ではありません。"
      },
      {
        "id": "ripple-damping",
        "title": "波紋は、なぜ弱くなる？",
        "original": "Viscous damping of gravity-capillary waves: Dispersion relations and nonlinear corrections",
        "authors": "A. Armaroliほか · 2018 · Physical Review Fluids",
        "url": "https://doi.org/10.1103/PhysRevFluids.3.124803",
        "method": "理論研究",
        "scope": "十分に深い流体と空気の境界を伝わる表面波。",
        "summary": "表面波の伝わり方に粘性が与える影響を調べ、散逸を含むモデルを整理しています。扱った条件では線形の散逸が主な役割を担います。",
        "meaning": "波紋が弱まる背景には、広がりに加えて粘性による減衰もあります。この研究は落下や王冠そのものではなく、できた波の伝播を扱います。"
      }
    ]
  }
];
