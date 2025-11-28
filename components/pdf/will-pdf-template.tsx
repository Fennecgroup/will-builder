import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { WillContent } from '@/lib/types/will'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  legalReference: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    textDecoration: 'underline',
  },
  text: {
    marginBottom: 5,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: 'bold',
  },
  listItem: {
    marginLeft: 20,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginVertical: 20,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    fontSize: 9,
    color: '#666',
  },
  warning: {
    backgroundColor: '#fff3cd',
    padding: 10,
    marginBottom: 15,
    fontSize: 9,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  signatureBlock: {
    marginTop: 25,
    marginBottom: 10,
  },
  signatureLine: {
    marginTop: 35,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
})

interface WillPDFTemplateProps {
  title: string
  content: WillContent
  createdAt: Date
}

export function WillPDFTemplate({ title, content, createdAt }: WillPDFTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LAST WILL AND TESTAMENT</Text>
          <Text style={styles.subtitle}>{title}</Text>
          <Text style={styles.legalReference}>In terms of the Wills Act 7 of 1953</Text>
        </View>

        {/* Important Warning */}
        <View style={styles.warning}>
          <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>⚠ IMPORTANT LEGAL NOTICE:</Text>
          <Text>
            This Will MUST be signed with PHYSICAL signatures by the Testator and TWO witnesses who
            are all present at the SAME TIME. Digital/electronic signatures are NOT valid under South
            African law.
          </Text>
        </View>

        {/* Article I - Revocation */}
        {content.revocationClause && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE I - REVOCATION</Text>
            <Text style={styles.text}>{content.revocationClause}</Text>
          </View>
        )}

        {/* Article II - Declaration */}
        {content.testator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE II - DECLARATION</Text>
            <Text style={styles.text}>
              I, <Text style={styles.bold}>{content.testator.fullName}</Text>, Identity Number{' '}
              <Text style={styles.bold}>{content.testator.idNumber}</Text>, of{' '}
              {content.testator.address?.street}, {content.testator.address?.city},{' '}
              {content.testator.address?.state}, {content.testator.address?.postalCode}, being of
              sound mind and memory, do hereby declare this to be my Last Will and Testament.
            </Text>
          </View>
        )}

        {/* Article III - Family Information */}
        {content.marriage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE III - FAMILY INFORMATION</Text>
            <Text style={styles.text}>
              Marital Status: <Text style={styles.bold}>{content.marriage.status}</Text>
            </Text>
            {content.marriage.spouse && (
              <Text style={styles.text}>
                I am married to <Text style={styles.bold}>{content.marriage.spouse.fullName}</Text>
                {content.marriage.spouse.idNumber && (
                  <Text> (ID: {content.marriage.spouse.idNumber})</Text>
                )}
                {content.marriage.spouse.dateOfMarriage && (
                  <Text>. We were married on {content.marriage.spouse.dateOfMarriage}</Text>
                )}.
              </Text>
            )}
            {content.marriage.children && content.marriage.children.length > 0 && (
              <>
                <Text style={styles.text}>
                  I have {content.marriage.numberOfChildren}{' '}
                  {content.marriage.numberOfChildren === 1 ? 'child' : 'children'}:
                </Text>
                {content.marriage.children.map((child, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {child.fullName}
                    {child.idNumber && ` (ID: ${child.idNumber})`}, born {child.dateOfBirth}
                    {child.isMinor && ' (minor)'}
                  </Text>
                ))}
              </>
            )}
          </View>
        )}

        {/* Article IV - Appointment of Executor */}
        {content.executors && content.executors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE IV - APPOINTMENT OF EXECUTOR</Text>
            {content.executors
              .filter((e) => !e.isAlternate)
              .map((executor, index) => (
                <Text key={index} style={styles.text}>
                  I nominate and appoint <Text style={styles.bold}>{executor.fullName}</Text> (ID:{' '}
                  {executor.idNumber}) as the Executor of my estate.
                </Text>
              ))}
            {content.executors.filter((e) => e.isAlternate).length > 0 && (
              <Text style={styles.text}>
                Failing whom, I nominate{' '}
                {content.executors
                  .filter((e) => e.isAlternate)
                  .map((executor, index) => (
                    <Text key={index}>
                      <Text style={styles.bold}>{executor.fullName}</Text> (ID: {executor.idNumber})
                      {index <
                        content.executors.filter((e) => e.isAlternate).length - 1 && ', '}
                    </Text>
                  ))}{' '}
                as alternate Executor.
              </Text>
            )}
          </View>
        )}

        {/* Article V - Guardianship */}
        {content.guardians && content.guardians.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE V - GUARDIANSHIP OF MINOR CHILDREN</Text>
            {content.guardians
              .filter((g) => !g.isAlternate)
              .map((guardian, index) => (
                <Text key={index} style={styles.text}>
                  I appoint <Text style={styles.bold}>{guardian.fullName}</Text> (ID:{' '}
                  {guardian.idNumber}) as guardian of my minor{' '}
                  {guardian.forChildren.length === 1 ? 'child' : 'children'}:{' '}
                  {guardian.forChildren.join(', ')}.
                </Text>
              ))}
            {content.guardians.filter((g) => g.isAlternate).length > 0 && (
              <Text style={styles.text}>
                Failing whom, I appoint{' '}
                {content.guardians
                  .filter((g) => g.isAlternate)
                  .map((guardian, index) => (
                    <Text key={index}>
                      <Text style={styles.bold}>{guardian.fullName}</Text> (ID: {guardian.idNumber})
                    </Text>
                  ))}{' '}
                as alternate guardian.
              </Text>
            )}
          </View>
        )}

        {/* Article VI - Minor Beneficiary Provisions */}
        {content.minorBeneficiaryProvisions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE VI - MINOR BENEFICIARY PROVISIONS</Text>
            <Text style={styles.text}>{content.minorBeneficiaryProvisions.instructions}</Text>
          </View>
        )}

        {/* Article VII - Specific Bequests */}
        {content.specificBequests && content.specificBequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE VII - SPECIFIC BEQUESTS</Text>
            <Text style={styles.text}>I give, devise, and bequeath the following specific items:</Text>
            {content.specificBequests.map((bequest, index) => {
              const beneficiary = content.beneficiaries.find((b) => b.id === bequest.beneficiaryId)
              return (
                <Text key={index} style={styles.listItem}>
                  {index + 1}. {bequest.description} to{' '}
                  <Text style={styles.bold}>{beneficiary?.fullName || 'Unknown Beneficiary'}</Text>
                </Text>
              )
            })}
          </View>
        )}

        {/* Article VIII - Assets */}
        {content.assets && content.assets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE VIII - DECLARATION OF ASSETS</Text>
            <Text style={styles.text}>
              I declare that my estate consists of the following assets (values are estimates):
            </Text>
            {content.assets.map((asset, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {asset.description}
                {asset.estimatedValue && (
                  <Text> (Value: R{asset.estimatedValue.toLocaleString()})</Text>
                )}
              </Text>
            ))}
          </View>
        )}

        {/* Article IX - Liabilities */}
        {content.liabilities && content.liabilities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE IX - LIABILITIES</Text>
            <Text style={styles.text}>
              I direct that all my just debts, funeral expenses, and estate duties be paid from my
              estate before distribution:
            </Text>
            {content.liabilities.map((liability, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {liability.type}: {liability.creditor} - R
                {liability.amount.toLocaleString()}
              </Text>
            ))}
          </View>
        )}

        {/* Article X - Beneficiaries */}
        {content.beneficiaries && content.beneficiaries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE X - BENEFICIARIES</Text>
            <Text style={styles.text}>I nominate the following beneficiaries:</Text>
            {content.beneficiaries.map((beneficiary, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. <Text style={styles.bold}>{beneficiary.fullName}</Text>
                {beneficiary.idNumber && ` (ID: ${beneficiary.idNumber})`} - {beneficiary.relationship}
                {beneficiary.allocationPercentage && ` - ${beneficiary.allocationPercentage}% of residue`}
                {beneficiary.isMinor && ' (MINOR)'}
              </Text>
            ))}
          </View>
        )}

        {/* Article XI - Residuary Estate */}
        {content.residuaryClause && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE XI - RESIDUARY ESTATE</Text>
            <Text style={styles.text}>{content.residuaryClause}</Text>
          </View>
        )}

        {/* Article XII - Special Instructions */}
        {content.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE XII - SPECIAL INSTRUCTIONS</Text>
            <Text style={styles.text}>{content.specialInstructions}</Text>
          </View>
        )}

        {/* Article XIII - Funeral Wishes */}
        {content.funeralWishes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE XIII - FUNERAL WISHES</Text>
            <Text style={styles.text}>
              Preference: <Text style={styles.bold}>{content.funeralWishes.preference}</Text>
            </Text>
            {content.funeralWishes.location && (
              <Text style={styles.text}>Location: {content.funeralWishes.location}</Text>
            )}
            {content.funeralWishes.specificInstructions && (
              <Text style={styles.text}>Instructions: {content.funeralWishes.specificInstructions}</Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Attestation Clause */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ATTESTATION</Text>
          <Text style={styles.text}>
            {content.attestationClause ||
              `SIGNED at ${content.placeExecuted || '[City]'} on this ${content.dateExecuted || '[Date]'}, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.`}
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.text}>
            <Text style={styles.bold}>TESTATOR SIGNATURE</Text>
          </Text>
          <Text style={styles.text}>{content.testator?.fullName}</Text>
          <Text style={styles.text}>ID Number: {content.testator?.idNumber}</Text>
          <Text style={styles.text}>Date: {content.dateExecuted || '_______________'}</Text>
        </View>

        {/* Witnesses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AS WITNESSES:</Text>
          <Text style={{ ...styles.text, fontSize: 9, fontStyle: 'italic', marginBottom: 12 }}>
            NOTE: Witnesses CANNOT be beneficiaries, executors, guardians, or spouses of any of the
            above. All witnesses must be 14+ years old and present at the same time.
          </Text>

          {content.witnesses && content.witnesses.length > 0 ? (
            content.witnesses.map((witness, index) => (
              <View key={index} style={{ marginBottom: 20 }}>
                <Text style={styles.text}>
                  <Text style={styles.bold}>WITNESS {index + 1}:</Text>
                </Text>
                <View style={styles.signatureLine} />
                <Text style={styles.text}>Name: {witness.fullName}</Text>
                {witness.idNumber && <Text style={styles.text}>ID Number: {witness.idNumber}</Text>}
                <Text style={styles.text}>
                  Address: {witness.address?.street}, {witness.address?.city},{' '}
                  {witness.address?.state}
                </Text>
                {witness.occupation && <Text style={styles.text}>Occupation: {witness.occupation}</Text>}
                <Text style={styles.text}>Date: {witness.dateWitnessed || '_______________'}</Text>
              </View>
            ))
          ) : (
            <>
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.text}>
                  <Text style={styles.bold}>WITNESS 1:</Text>
                </Text>
                <View style={styles.signatureLine} />
                <Text style={styles.text}>Name: ___________________________________</Text>
                <Text style={styles.text}>ID Number: ___________________________________</Text>
                <Text style={styles.text}>Address: ___________________________________</Text>
                <Text style={styles.text}>Date: _______________</Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={styles.text}>
                  <Text style={styles.bold}>WITNESS 2:</Text>
                </Text>
                <View style={styles.signatureLine} />
                <Text style={styles.text}>Name: ___________________________________</Text>
                <Text style={styles.text}>ID Number: ___________________________________</Text>
                <Text style={styles.text}>Address: ___________________________________</Text>
                <Text style={styles.text}>Date: _______________</Text>
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Fennec Will Builder on {new Date(createdAt).toLocaleDateString()}</Text>
          <Text style={{ marginTop: 5, fontWeight: 'bold' }}>
            ⚠ This is a computer-generated document template.
          </Text>
          <Text style={{ marginTop: 3 }}>
            IMPORTANT: This Will MUST be printed and signed with PHYSICAL signatures. Consult with a
            South African attorney to ensure full compliance with the Wills Act 7 of 1953 and current
            legal requirements.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
