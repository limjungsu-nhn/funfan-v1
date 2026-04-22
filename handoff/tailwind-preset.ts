/**
 * FunFan v1.0 Tailwind Preset
 * ---------------------------------------------------------------
 * 사용법 (개발자):
 *   // tailwind.config.ts
 *   import funfanPreset from './handoff/tailwind-preset';
 *   export default {
 *     presets: [funfanPreset],
 *     content: ['./src/**\/*.{ts,tsx}'],
 *   };
 *
 * Source of truth: css/tokens/*.css
 * 이 파일이 토큰 원본과 어긋나면 design-tokens.json을 재확인.
 * ---------------------------------------------------------------
 */

import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      /* ---------- Colors ---------- */
      colors: {
        // White
        white: {
          100: 'rgba(255, 255, 255, 1)',
          50:  'rgba(255, 255, 255, 0.5)',
          30:  'rgba(255, 255, 255, 0.3)',
          0:   'rgba(255, 255, 255, 0)',
          warm: '#FCFBF7',
        },
        // Black
        black: {
          100: 'rgba(0, 0, 0, 1)',
          50:  'rgba(0, 0, 0, 0.5)',
          30:  'rgba(0, 0, 0, 0.3)',
          0:   'rgba(0, 0, 0, 0)',
        },
        // Font
        font: {
          'primary-black-100': 'rgba(29, 29, 31, 1)',
          'primary-black-50':  'rgba(29, 29, 31, 0.5)',
          'primary-black-30':  'rgba(29, 29, 31, 0.3)',
          'primary-black-0':   'rgba(29, 29, 31, 0)',
          'primary-white-100': 'rgba(255, 255, 255, 1)',
          'primary-white-50':  'rgba(255, 255, 255, 0.5)',
          'primary-white-30':  'rgba(255, 255, 255, 0.3)',
          'primary-white-0':   'rgba(255, 255, 255, 0)',
          secondary: '#6E6E73',
          divider:   '#C7C7CC',
        },
        // Gray
        gray: {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        // Red
        red: {
          100: 'rgba(255, 17, 0, 1)',
          50:  'rgba(255, 17, 0, 0.5)',
          30:  'rgba(255, 17, 0, 0.3)',
          0:   'rgba(255, 17, 0, 0)',
        },
        // Brand: Nature
        nature: {
          1: '#244D01',
          2: '#326502',
          3: '#558C03',
          4: '#B3D92B',
          5: '#DDF291',
          6: '#EDFAB8',
        },
        // Brand: Wood
        wood: {
          1: '#352619',
          2: '#60452E',
          3: '#8D6F4B',
          4: '#BB9E77',
          5: '#DACAAB',
          6: '#F5EFE3',
        },
        // Brand: Sky
        sky: {
          1: '#0A3A6B',
          2: '#1A64B0',
          3: '#5BADFF',
          4: '#8EC8FF',
          5: '#BDE0FF',
          6: '#E4F3FF',
        },
        // Star
        star: '#FFB800',
        // Semantic — Background
        bg: {
          base: '#FFFFFF', // 순수 흰색 페이지 배경
          soft: '#F8F8FB', // gray-6 + 50% 흰색 합성 단색
        },
      },

      /* ---------- Spacing (component level, absolute px) ----------
         Usage: className="p-space-4 gap-space-2"
      ---------------------------------------------------------- */
      spacing: {
        'space-1':   '4px',
        'space-1_5': '6px',
        'space-2':   '8px',
        'space-2_5': '10px',
        'space-3':   '12px',
        'space-3_5': '14px',
        'space-4':   '16px',
        'space-5':   '20px',
        'space-5_5': '22px',
        'space-6':   '24px',
        'space-7':   '28px',
        'space-8':   '32px',
        'space-9':   '36px',
        'space-10':  '40px',
        'space-12':  '48px',
        'space-14':  '56px',
        'space-16':  '64px',
        'space-20':  '80px',

        /* Layout percent (page level, 1440 기준) */
        'p1':   '14.4px',
        'p2':   '28.8px',
        'p2-5': '36px',
        'p3':   '43.2px',
        'p4':   '57.6px',
        'p5':   '72px',
        'p6':   '86.4px',
        'p7':   '100.8px',
        'p8':   '115.2px',
        'p9':   '129.6px',
        'p10':  '144px',
        'p12':   '172.8px',
        'p12_5': '180px',
        'p15':   '216px',
        'p20':  '288px',
        'p25':  '360px',
        'p30':  '432px',
        'p33':  '475.2px',
        'p35':  '504px',
        'p40':  '576px',
        'p50':  '720px',
        'p60':  '864px',
        'p66':  '950.4px',
        'p70':  '1008px',
        'p75':  '1080px',
        'p80':  '1152px',
        'p83':  '1195.2px',
        'p90':  '1296px',
        'p100': '1440px',

        /* Navbar height */
        'navbar': '64px',
      },

      minWidth: {
        'base': '1440px', // 모든 페이지 최소 가로
      },

      /* ---------- Border Radius ----------
         css/tokens/layout.css 미러. 용도별 시맨틱 네이밍.
      ---------------------------------------- */
      borderRadius: {
        'xs':   '4px',   // revenue bar, 내부 썸네일
        '2xs':  '8px',   // episode-item, float-btn, review-item 썸네일
        'sm':   '10px',  // form-input, input-wood
        'btn':  '12px',  // button, radio-card (base)
        'md':   '16px',  // chat-input, msg-bubble, my-msg, accordion-row
        'lg':   '20px',  // water-card, revenue-card, stat-card
        'xl':   '24px',  // series-card, episode-card, garden-card, radio-group-card
        'full': '100px', // 원형·pill (avatar, icon-btn, send-btn, tab, badge)
      },

      /* ---------- Typography ---------- */
      fontFamily: {
        base: [
          '"Hiragino Sans"',
          '"ヒラギノ角ゴ ProN"',
          '"Hiragino Kaku Gothic ProN"',
          'sans-serif',
        ],
      },

      fontSize: {
        // Format: [fontSize, { lineHeight, fontWeight }]
        'overline':  ['11px', { lineHeight: '16px' }],
        'caption':   ['12px', { lineHeight: '18px' }],
        'assist':    ['13px', { lineHeight: '20px' }],
        'subtext':   ['14px', { lineHeight: '22px' }],
        'body-sm':   ['15px', { lineHeight: '24px' }],
        'body-md':   ['16px', { lineHeight: '26px' }],
        'body-lg':   ['18px', { lineHeight: '28px' }],
        'body-xl':   ['20px', { lineHeight: '28px' }],
        'h3':        ['22px', { lineHeight: '32px' }],
        'h2':        ['28px', { lineHeight: '38px' }],
        'h1':        ['36px', { lineHeight: '48px' }],
        'display4':  ['44px', { lineHeight: '52px' }],
        'display3':  ['48px', { lineHeight: '58px' }],
        'display2':  ['60px', { lineHeight: '72px' }],
        'display1':  ['72px', { lineHeight: '84px' }],
      },

      fontWeight: {
        w4: '400',
        w6: '600',
      },

      /* ---------- Box Shadow ---------- */
      boxShadow: {
        'sm':   '0px 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0px 4px 8px rgba(0, 0, 0, 0.02), 0px 0px 1px rgba(0, 0, 0, 0.10)',
        'ring': '0px 0px 0px 3px #E5E5EA, 0px 1px 2px rgba(0, 0, 0, 0.05)',
      },

      /* ---------- Ring Width ---------- */
      ringWidth: {
        '3': '3px',
      },

      /* ---------- Transitions ---------- */
      transitionDuration: {
        press: '80ms',
        collapse: '220ms',
      },
    },
  },
};

export default preset;
