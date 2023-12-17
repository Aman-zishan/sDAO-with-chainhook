
;; title: milestone-extension
;; version:
;; summary:
;; description:

;; traits
;;
(impl-trait .extension-trait.extension-trait)
(use-trait proposal-trait .proposal-trait.proposal-trait)

;; token definitions
;; 

;; constants
;;
(define-constant ERR_UNAUTHORIZED (err u3000))
(define-constant ERR_BLOCK_HEIGHT_NOT_REACHED (err u3001))
(define-constant ERR_NO_MILESTONE_FOUND (err u3002))
(define-constant ERR_MILESTONE_ALREADY_CLAIMED (err u3003))

;; data vars
;;

;; data maps
;;
(define-map grants
  {owner: principal, milestoneId: uint}
  { start-height: uint, end-height: uint, amount: uint, claimed: bool }
)

;; Internal DAO functions
;;
(define-public (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender .core) (contract-call? .core is-extension contract-caller)) ERR_UNAUTHORIZED))
)

;; #[allow(unchecked_params)]
;; #[allow(unchecked_data)]
(define-public (set-milestone (proposal principal) (milestone { id: uint, start-height: uint, end-height: uint, amount: uint }))
  (begin 
        (try! (is-dao-or-extension))

        (map-insert grants 
          {
            owner: proposal, 
            milestoneId: (get id milestone)
          } 
          (merge 
          { 
            start-height: (get start-height milestone),
            end-height: (get end-height milestone), 
            amount: (get amount milestone)
          } 
          {claimed: false}
          )
        )

      (ok true)
  ) 
)

;; #[allow(unchecked_params)]
;; #[allow(unchecked_data)]
(define-public (claim (proposal principal) (milestone-id uint) (recipient principal))
  (let 
    (
      (milestone (unwrap! (get-milestone proposal milestone-id) ERR_NO_MILESTONE_FOUND))
      (end-height (get end-height milestone))
      (amount (get amount milestone))
      (claimed (get claimed milestone))

    )
    (try! (is-dao-or-extension))
    ;; checks if the milestone end-height is reached
    (asserts! (> block-height end-height) ERR_BLOCK_HEIGHT_NOT_REACHED)
    (asserts! (not claimed) ERR_MILESTONE_ALREADY_CLAIMED)
    ;; transfers the STX funds to recipient
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    (map-set grants
      {
        owner: proposal, 
        milestoneId: milestone-id
      } 
      (merge milestone {claimed: true})
    )
    
    (ok true)
  )
)

;; public functions
;;

(define-read-only (get-milestone (proposal principal) (milestone-id uint))
  (map-get? grants {owner: proposal, milestoneId: milestone-id})
)

(define-public (callback (sender principal) (memo (buff 34)))
    (ok true)
)