UPDATE students st
SET st.graduation_status = 'issued'
WHERE EXISTS (
    SELECT 1
    FROM certificates c
    WHERE c.student_id = st.id
      AND c.status = 'issued'
)
  AND st.graduation_status <> 'issued';
