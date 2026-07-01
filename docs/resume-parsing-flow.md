# Resume Parsing Flow

## Old Flow

```text
Resume Upload
-> Azure OpenAI Resume Parser
-> Resume JSON
-> Azure OpenAI Candidate Form Mapping
-> Candidate Form JSON
-> Candidate Form Auto Fill
```

The old flow used a second Azure OpenAI request to convert parsed resume JSON into the ARROWS Candidate Form schema.

## New Flow

```text
Resume Upload
-> Azure OpenAI Resume Parser
-> Resume JSON
-> Local Resume Field Mapper
-> Candidate Form JSON
-> Candidate Form Auto Fill
```

The Azure resume parser remains the single source of resume extraction. It still returns the same resume JSON shape. Candidate Form mapping now happens locally through `src/utils/resumeFieldMapper.js`.

## Rationale

- One Azure OpenAI request per resume parse.
- Lower resume parsing latency by removing the second network and model inference call.
- Reduced Azure token usage and cost.
- Deterministic field mapping for known schema paths.
- Easier maintenance through `FIELD_MAPPING`, `getNestedValue`, and `setNestedValue`.
- React form components continue receiving the same Candidate Form schema they received before.

## Local Mapper

The mapper uses configuration-driven nested paths:

```text
candidate_information.first_name -> personal_information.first_name
current_company_information.current_company_name -> professional_information.current_company
```

Skills are mapped by selecting an explicit primary skill when the parser provides one. Otherwise, the first skill becomes the primary skill and remaining skills become secondary skills.
