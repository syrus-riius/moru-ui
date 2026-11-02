# Source and dependency notices

Original Moru UI code and documentation are licensed under the MIT License in
`LICENSE`. Keep that license and its copyright notice when redistributing copies
or substantial portions. Third-party software and assets retain their own terms.
The repository, source starters and local packages are not published npm packages.
`private: true` prevents accidental npm publication; it does not restrict the MIT
license granted to Moru's own source.

## Third-party code

Dependencies are installed with npm. Preserve applicable notices if you bundle or
redistribute them. Complete terms are in each installed package's `LICENSE*` files.

| Dependency | License / notice |
| --- | --- |
| React and React DOM | MIT; Meta and contributors |
| Base UI | MIT; MUI and contributors |
| Lucide icons | ISC; Lucide contributors |
| TanStack Table, Embla Carousel, Recharts, React Resizable Panels | MIT; respective contributors |
| TypeScript | Apache-2.0; Microsoft and contributors |
| Vite, Tailwind CSS and their plugins | See each package's license |
| Expo, Expo Router, React Native and native modules | See each package's license; preserve the Expo starter notice in `apps/moru-expo/LICENSE` |

## Fonts and derived assets

Pretendard, Noto Sans and Noto Sans KR use the SIL Open Font License 1.1. Their
licenses are not replaced by Moru's MIT license. Font notices are included at:

- `public/brand/Pretendard-LICENSE.txt`
- `public/licenses/noto-sans-OFL.txt`
- `public/licenses/noto-sans-kr-OFL.txt`
- `public/native-preview/fonts/*-LICENSE.txt` for the generated native web preview

Moru's wordmark SVG paths were derived from Pretendard glyphs. Preserve the
Pretendard notice when redistributing the brand assets. Web starters load fonts
from their npm packages; source starters do not include dependencies' node_modules.

## References

shadcn/ui and other design references inspired the gallery and distribution plan.
Moru is an independent implementation and is not affiliated with those projects.
Reference links are not grants to redistribute third-party paid components,
screenshots, videos, or other assets.
