# Source and dependency notices

Original Moru UI code and documentation are licensed under the MIT License in
`LICENSE`, copyright 2026 SYRUS RIIUS and Moru UI contributors. Keep that license
and its copyright notice when redistributing copies or substantial portions.
Third-party software and assets retain their own terms.

This notice applies to the `moru-ui` web npm package. The UI Lab, source starters,
React Native package, and Expo application are separate parts of the source
repository and are not included in this npm distribution.

## Third-party code

Dependencies are installed separately through npm and are not bundled into
Moru's emitted JavaScript. Preserve applicable notices if you bundle or
redistribute them. Complete terms are in each installed package's `LICENSE*`
files; this summary does not replace those terms.

| Dependency | License / notice |
| --- | --- |
| React and React DOM | MIT; Meta and contributors |
| Base UI | MIT; MUI and contributors |
| Lucide icons | ISC; Lucide contributors |
| TanStack Table | MIT; TanStack and contributors |
| Embla Carousel | MIT; respective contributors |
| Recharts | MIT; respective contributors |
| React Resizable Panels | MIT; respective contributors |

TanStack Table, Embla Carousel, Recharts, and React Resizable Panels are optional
peer dependencies required by their corresponding package entry points. Moru's
build uses TypeScript (Apache-2.0; Microsoft and contributors) and other tools;
their licenses remain applicable to those tools and any redistributed portions.

## Fonts and brand assets

This package does not include font binaries, the Moru wordmark, or UI Lab imagery.
Font-family tokens refer to names and system fallbacks; they do not load fonts.
Applications that install or redistribute fonts must preserve the fonts' own
license notices. Pretendard, Noto Sans, and Noto Sans KR use the SIL Open Font
License 1.1, which is not replaced by Moru's MIT license.

The source repository includes font notices in `public/brand/Pretendard-LICENSE.txt`,
`public/licenses/noto-sans-OFL.txt`, and `public/licenses/noto-sans-kr-OFL.txt`.
Moru's source-repository wordmark SVG paths were derived from Pretendard glyphs;
preserve the Pretendard notice when separately redistributing those brand assets.

## References

shadcn/ui and other design references inspired the gallery and distribution plan.
Moru is an independent implementation and is not affiliated with those projects.
Reference links are not grants to redistribute third-party paid components,
screenshots, videos, or other assets.
