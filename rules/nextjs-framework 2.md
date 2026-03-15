# Next.js Framework Rules & Best Practices

## 1. Server Components 우선 사용 (Prefer Server Components)
- **기본값으로 Server Component 사용**: 클라이언트 상호작용(예: `onClick`, `useState`, `useEffect`)이나 브라우저 API가 명시적으로 필요한 경우에만 파일 최상단에 `'use client'` 지시어를 추가하여 Client Component로 전환하세요.
- **성능 최적화**: Server Components를 사용하면 클라이언트로 전송되는 JavaScript 번들 크기를 줄이고, 데이터베이스나 백엔드 서비스에 직접 접근하여 초기 로딩 속도와 SEO를 개선할 수 있습니다.
- **Client Component 최소화**: 상태 관리가 필요한 UI 요소(예: 버튼, 모달, 입력 폼)만 Client Component로 분리하고, 레이아웃이나 데이터 패칭은 Server Component 계층에서 처리하여 Props로 내려주세요. (패턴: Client Component를 Leaf Node로 유지)

## 2. 가독성 높고 간결한 코드 유지 (Write Clear & Concise Code)
- **단일 책임 원칙 (SRP)**: 각 컴포넌트와 함수는 하나의 명확한 역할만 수행해야 합니다.
- **의도를 알 수 있는 네이밍**: 변수, 함수, 컴포넌트의 이름은 그 역할과 목적을 명확히 드러내도록 직관적으로 작성하세요.
- **조기 리턴 (Early Return)**: 중첩된 `if` 문을 줄이고, 예외 상황이나 조건 불만족 시 코드 상단에서 일찍 반환(return)하여 핵심 로직의 가독성을 높이세요.

## 3. 파일 크기 제한 및 모듈 분리 (Split Large Files)
- **코드 베이스 크기 제한**: 하나의 파일(컴포넌트, 페이지 등)이 지나치게 길어지거나(예: 200~300줄 이상) 복잡해지면 파일 분리를 적극적으로 고려하세요.
- **역할 단위 분리**: 복잡한 UI는 여러 개의 작고 재사용 가능한 하위 컴포넌트로 쪼개고, 복잡한 비즈니스 로직이나 데이터 가공 로직은 커스텀 훅(`hooks/`)이나 유틸리티 함수(`utils/`)로 추출하세요.
- **관심사 분리**: 화면 렌더링 코드와 데이터 구조 및 로직을 한 파일 섞지 마세요. 

---

## 💡 추가 추천 규칙 (Next.js App Router 특화)

### 4. 내장 최적화 컴포넌트 적극 활용 (Use Next.js Optimizations)
- **이미지**: 기본 `<img>` 태그 대신 `next/image`의 `<Image>` 컴포넌트를 사용하여 자동 이미지 최적화, 지연 로딩(Lazy loading), CLS(Cumulative Layout Shift) 방지를 적용하세요.
- **네비게이션**: 내부 페이지 이동 시 항상 `next/link`의 `<Link>` 컴포넌트를 사용하여 프리패칭(Prefetching) 및 클라이언트 측 라우팅의 이점을 누리세요.
- **폰트**: `next/font`를 사용하여 외부 폰트를 빌드 타임에 다운로드하고 셀프 호스팅하여 성능을 최적화하세요.

### 5. 데이터 Fetching 및 Mutation 전략
- **Server Component에서 데이터 Fetching**: 가능한 경우 최상단 Server Component에서 `fetch()` API 등을 이용해 데이터를 가져오세요. (Next.js의 Request Memoization, Data Cache 활용)
- **Server Actions 활용**: 폼 제출이나 데이터 변경(Mutation) 시 별도의 API Route를 생성하기보다 Server Actions를 사용하여 클라이언트와 서버 간의 통신 로직을 간소화하세요.

### 6. 로딩 및 에러 상태 관리 (Loading & Error UI)
- **스트리밍 UI**: `loading.tsx` 파일을 적극 활용하여 데이터가 로딩되는 동안 사용자에게 즉각적인 스켈레톤(Skeleton) 화면이나 스피너를 보여주어 UX를 향상시키세요.
- **우아한 에러 헨들링**: `error.tsx` (Error Boundary)를 작성하여 특정 컴포넌트 트리에서 에러가 발생했을 때 전체 앱이 크래시되지 않도록 하고, 사용자에게 적절한 복구 UI를 제공하세요.

### 7. 라우팅 규칙 엄수 (Colocation & Routing)
- **App Router 규약 준수**: 라우팅에 관여하는 파일은 반드시 프레임워크 규약(`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`)을 따라야 합니다.
- **안전한 Colocation**: 라우팅 대상이 아닌 UI 컴포넌트, 테스트 코드, 스타일 파일 등은 해당 페이지 폴더에 같이 두거나(Colocation), 프로젝트 구조(`src/features`, `src/shared`)에 맞게 적절히 분리하여 캡슐화를 유지하세요.
