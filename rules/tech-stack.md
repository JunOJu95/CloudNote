---
trigger: always_on
---

# Tech Stack Rules & Guidelines

이커머스 프로젝트의 일관성과 유지보수성을 높이기 위해, 아래 명시된 기술 스택과 관련 원칙들을 핵심 룰로 삼고 개발을 진행합니다.

## 1. 프론트엔드 코어 (Frontend Core)
- **프레임워크**: Next.js (App Router 기반)
- **언어**: TypeScript (Strict 모드 활성화)
- **주요 원칙**:
  - `app/` 라우터를 기반으로 Server Component를 기본으로 사용합니다.
  - 브라우저 API나 상태(State), 이벤트 리스너가 필요한 경우에만 최소한의 범위로 `'use client'` 지시어를 사용하여 Client Component를 만듭니다.
  - 컴포넌트는 단일 책임 원칙을 준수하며 가독성을 유지하도록 분리합니다.

## 2. 백엔드 서비스 (Backend as a Service)
- **서비스**: Supabase (PostgreSQL 기반 BaaS)
- **인증 및 인가 (Auth)**:
  - 회원가입, 로그인 등 인증 처리는 Supabase Auth를 활용합니다.
  - 데이터베이스의 보안을 위해 **RLS(Row Level Security)** 정책을 반드시 설정하고 적용해야 합니다.
- **데이터 패칭 및 통신 (Data Fetching & Mutation)**:
  - 서버(Server Component, Server Actions, Route Handlers)에서 Supabase 클라이언트를 생성할 때는 `@supabase/ssr` 패키지를 사용합니다.
  - 민감한 데이터 통신과 데이터베이스 쿼리는 **가능한 모두 서버 사이드(Server Actions 등)**에서 처리하여 API Key나 쿼리 로직이 클라이언트에 노출되지 않도록 합니다.

## 3. 타입 세이프티 (Type Safety)
- **Supabase Type Generation**:
  - Supabase 데이터베이스의 스키마 변경 시, CLI를 통해 TypeScript 타입을 자동 생성(`types/supabase.ts`)하여 앱 전체에서 활용합니다.
  - 데이터 쿼리 결과를 타입 캐스팅(`as Type`)하기보다 제네릭을 통해 안전하게 타입을 추론하도록 설계합니다.
- **스키마 검증 (Schema Validation)**:
  - 사용자 입력값(폼 등)이나 외부 API 응답 데이터 검증을 위해 `Zod` 라이브러리를 적극 권장합니다.
  - 폼 처리 시 `react-hook-form`과 `zod` 리졸버를 함께 사용하여 깔끔하고 안전한 폼 관리를 추구합니다.
- **마이그레이션 (Migration)**
  - supabase/migrations 폴더에 위치
  - 마이그레이션을 수정하거나 삭제하거나 새로 생성할 때는 항상 사용자의 허가 받기.

## 4. 스타일링 (Styling)
- **CSS 프레임워크**: Tailwind CSS (PostCSS 기반)
- **UI 컴포넌트**: 필요 시 `Shadcn UI` (또는 Radix UI 기반의 Headless 컴포넌트)를 사용하여 접근성과 디자인 일관성을 높입니다.
- **원칙**:
  - 전역 스코프(`globals.css`)의 CSS 작성은 최소화하고, 모든 스타일링은 Tailwind 유틸리티 클래스를 이용합니다.
  - 긴 클래스명은 `clsx`와 `tailwind-merge`(`twMerge`)를 결합한 유틸리티 파일(예: `cn()`)을 만들어 가독성 있게 조건부 렌더링합니다.

## 5. 상태 관리 (State Management)
- **클라이언트 상태**:
  - 단순한 로컬 상태는 `useState`, `useReducer`를 사용합니다.
  - 전역 클라이언트 상태 관리가 필요한 경우(예: 다크모드 설정, 장바구니 UI 등) `Zustand`를 우선적으로 고려합니다.
- **서버 상태**:
  - Next.js의 내장 캐싱 시스템(`fetch` 캐시, Request Memoization)을 최대한 활용하여 서버 상태를 관리합니다.
  - 복잡한 클라이언트 사이드 데이터 패칭이 필요한 경우에 한해 `SWR` 이나 `React Query` 도입을 고려하지만, 기본적으로는 Next.js App Router의 데이터 Fetching 패러다임을 따릅니다.
