import React from 'react';

function LLMao({ consent, setConsent }: { consent; setConsent }) {
  return (
    <>
      {!consent && (
        <div className="container">
          <h2>CONSENT</h2>
          <div className="wrapper">
            <p className="container error">
              Comrade, I urge you most solemnly: do not be swayed by unsubstantiated claims. Verify
              information before disseminating it further! This so-called intelligence is nothing
              but the ramblings of modern technology, which, despite its confidence, knows naught of
              true facts. Let us remain vigilant and steadfast in our commitment to truth and
              discipline—our strength lies in unity and the unwavering pursuit of accurate
              knowledge.
            </p>
            <img src="/chat.png" alt="LLMao" width={`161`} className="proletarian" />
            <label>
              <input type="checkbox" name="consent" onChange={() => setConsent(!consent)} /> I
              acknowledge that spreading wrong information is counter-revolutionary. I pledge to
              uphold truth and discipline by verifying all information before dissemination.
            </label>
          </div>
        </div>
      )}
    </>
  );
}

export default LLMao;
