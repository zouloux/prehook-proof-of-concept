/**
 *
 * http://youmightnotneedjquery.com/
 *
 *
 * Sélection
 * -> $( selector:string )						Sélectionner un ou plusieurs éléments dans le document entier
 * -> $( from|Element, selector )				Sélectionner un ou plusieurs éléments depuis un noeud DOM
 * -> $( element|Element )						Convertir un élément en collection
 * -> $( [Element, Element] )					Convertir plusieurs éléments en collection
 *
 * Collection -- FIXME : Sûr de ça ? peut-être que all suffit et ensuite on re $( el )
 * -> $.children as $[]							Passer le NodeList children en tant que tableau de $
 * -> $.eq as $									Target un element en tant que collection depuis la collection
 * -> $[0] as Element							Target un Element natif depuis la collection
 * -> $.length									Le nombre d'éléments dans la collection
 * -> $.all										Tous les éléments en array natif
 *
 * Evènements
 * -> $.ready()									Lorsque la DOM est prête
 * -> $.load()									Lorsque le document est chargé
 * -> $.on / $.off								Ajouter / Supprimer un évènement
 * -> $.trigger( event )						Dispatcher un évènement custom
 *
 * Récupération de la position uniformisée
 * -> $.viewportPosition() -> {top, left}		Récupérer la position relative au viewport
 * -> $.documentPosition() -> {top, left}		Récupérer la position relative au document
 * -> $.relativePosition() -> {top, left}		Récupérer la position relative au premier parent en position: relative|absolute
 *
 * Gestion de la display list
 * -> $.remove()								Supprimer un noeud de son parent
 * -> $.appendTo( $|Element, after?:$|Element )	Ajouter un Element ou une collection dans un autre element
 * -> $.parents( selector )						Cibler les parents répondant au sélecteur
 * -> $.parent()								Retourner une collection ciblant le parent						FIXME : Sûr de ça ?
 *
 *
 * Pas besoin :
 * -> $.classes -> A voir si besoin de polyfiller en lisant classes en string ou en utilisant le clasList ES6
 * -> $.classes.add / $.classes.has / $.classes.remove / $.classes.toggle
 * -> Read style (height with outer margin par ex) ?
 * -> Write style ?
 */


export function $ ( containerOrSelector:Element|string, selector?:string )
{
	// TODO -> Ajouter la possibilité de ne passer qu'un Element sans selecteur
	// TODO -> Ou une liste d'elements en array
	// TODO -> Pour convertir en objet $


	let container:Element|Document = containerOrSelector as Element;
	if ( selector == null )
	{
		selector = containerOrSelector as string;
		container = document;
	}

	// Target selector from element container
	const elements = container.querySelectorAll( selector );

	// Convert NodeList to static list
	// so we quired all our objects and we have native array
	const list = [];
	elements.forEach( (node, i) => list[i] = node );


	// TODO -> Convertir chaque élément en objet $ ?




	return {
		all: list,
		first: list[0],
		...list,
		/*
		method: () =>
		{

		}
		*/
	}
}
