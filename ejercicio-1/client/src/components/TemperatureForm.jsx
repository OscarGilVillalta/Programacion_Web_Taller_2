import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
} from 'reactstrap'

function TemperatureForm({
  valor,
  onCambiar,
  onSubmit,
  onReiniciar,
  enviando,
  reiniciando,
  error,
}) {
  const disabled = enviando || reiniciando

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Card className="panel panel--form" aria-labelledby="form-title">
      <CardBody>
        <div className="panel__heading">
          <p className="eyebrow">Ajuste manual</p>
          <CardTitle tag="h2" id="form-title">
            Temperatura de ajuste
          </CardTitle>
        </div>

        <Form
          className="temperature-form"
          onSubmit={handleSubmit}
          aria-busy={enviando}
          noValidate
        >
          <FormGroup className="field">
            <Label className="field__label" htmlFor="temperatura">
              Valor objetivo
            </Label>
            <InputGroup className="field__control">
              <Input
                id="temperatura"
                name="temperatura"
                type="number"
                min="1"
                max="100"
                step="1"
                inputMode="numeric"
                autoComplete="off"
                placeholder="50"
                value={valor}
                onChange={(event) => onCambiar(event.target.value)}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error
                    ? 'temperatura-hint feedback-error'
                    : 'temperatura-hint'
                }
              />
              <InputGroupText className="field__suffix" aria-hidden="true">
                °C
              </InputGroupText>
            </InputGroup>
            <FormText className="field__hint" id="temperatura-hint">
              Número entero entre 1 y 100.
            </FormText>
          </FormGroup>

          <div className="form-actions">
            <Button
              className="button-primary"
              type="submit"
              disabled={disabled}
            >
              {enviando ? 'Ajustando…' : 'Enviar intento'}
            </Button>

            <Button
              className="button-secondary"
              type="button"
              onClick={onReiniciar}
              disabled={enviando || reiniciando}
              aria-label="Reiniciar reactor y borrar el historial"
            >
              {reiniciando ? 'Reiniciando…' : 'Reiniciar'}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default TemperatureForm
